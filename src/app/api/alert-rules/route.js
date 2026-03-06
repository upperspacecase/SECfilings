import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import AlertRule from "@/models/AlertRule";
import { MOCK_ALERT_RULES } from "@/lib/mock-data";

// In-memory store for mock mode only
let mockRules = [...MOCK_ALERT_RULES];
let nextMockId = 100;

export async function GET() {
    const db = await connectDB();

    if (!db) {
        return NextResponse.json({ rules: mockRules });
    }

    try {
        const rules = await AlertRule.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json({ rules });
    } catch (err) {
        console.error("MongoDB query error:", err.message);
        return NextResponse.json({ rules: mockRules });
    }
}

export async function POST(request) {
    const body = await request.json();
    const db = await connectDB();

    const ruleData = {
        name: body.name || "Untitled Rule",
        enabled: true,
        filters: {
            sicCodes: body.filters?.sicCodes || [],
            states: body.filters?.states || [],
            minOfferingAmount: body.filters?.minOfferingAmount || null,
            maxOfferingAmount: body.filters?.maxOfferingAmount || null,
            watchlistCompanies: body.filters?.watchlistCompanies || [],
            watchlistPersons: body.filters?.watchlistPersons || [],
        },
    };

    if (!db) {
        const newRule = {
            _id: `rule-${nextMockId++}`,
            ...ruleData,
            triggerCount: 0,
            lastTriggered: null,
            createdAt: new Date().toISOString(),
        };
        mockRules.unshift(newRule);
        return NextResponse.json({ rule: newRule }, { status: 201 });
    }

    try {
        // TODO: get real userId from Clerk session
        ruleData.userId = "000000000000000000000000"; // placeholder
        ruleData.clerkUserId = "placeholder";

        const rule = await AlertRule.create(ruleData);
        return NextResponse.json({ rule: rule.toObject() }, { status: 201 });
    } catch (err) {
        console.error("Failed to create rule:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
