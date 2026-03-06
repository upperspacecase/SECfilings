import { NextResponse } from "next/server";

export async function GET(request) {
    // In production: verify CRON_SECRET, run poller, matcher, notifier
    return NextResponse.json({
        message: "EDGAR poller stub — connect MongoDB and configure CRON_SECRET to activate",
        newFilings: 0,
        alertsSent: 0,
    });
}
