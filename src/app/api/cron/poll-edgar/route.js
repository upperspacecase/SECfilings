import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Filing from "@/models/Filing";
import AlertRule from "@/models/AlertRule";
import { pollEdgar } from "@/lib/edgar/poller";
import { matchFilingsToRules } from "@/lib/alerts/matcher";
import { sendAlertEmails } from "@/lib/alerts/notifier";

export const maxDuration = 60; // Vercel Pro: up to 60s
export const dynamic = "force-dynamic";

export async function GET(request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
        return NextResponse.json(
            { error: "MongoDB not configured — cannot poll" },
            { status: 503 }
        );
    }

    try {
        // Get existing accession numbers for dedup
        const existing = await Filing.find({}, { accessionNumber: 1 }).lean();
        const existingAccessions = new Set(existing.map((f) => f.accessionNumber));

        // Poll EDGAR for new filings
        const newFilings = await pollEdgar(existingAccessions);

        if (newFilings.length === 0) {
            return NextResponse.json({
                message: "No new filings found",
                newFilings: 0,
                alertsSent: 0,
            });
        }

        // Save new filings to MongoDB
        const saved = [];
        for (const filing of newFilings) {
            try {
                const doc = await Filing.create(filing);
                saved.push(doc);
            } catch (err) {
                // Skip duplicates (E11000) silently
                if (err.code !== 11000) {
                    console.error(`Failed to save filing ${filing.accessionNumber}:`, err.message);
                }
            }
        }

        // Match against alert rules
        const rules = await AlertRule.find({ enabled: true }).lean();
        const matches = matchFilingsToRules(saved, rules);

        // Send alert emails
        let alertsSent = 0;
        if (matches.length > 0) {
            // TODO: look up user emails from User model via rule.userId
            // For now, log the matches
            for (const match of matches) {
                console.log(
                    `Alert rule "${match.rule.name}" matched ${match.matchedFilings.length} filings`
                );
                alertsSent += match.matchedFilings.length;

                // Update rule trigger count
                await AlertRule.findByIdAndUpdate(match.rule._id, {
                    lastTriggered: new Date(),
                    $inc: { triggerCount: match.matchedFilings.length },
                });
            }
        }

        return NextResponse.json({
            message: `Processed ${saved.length} new filings`,
            newFilings: saved.length,
            alertsMatched: alertsSent,
            totalPolled: newFilings.length,
        });
    } catch (err) {
        console.error("Poller error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
