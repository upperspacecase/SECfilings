import { NextResponse } from "next/server";
import { MOCK_ALERT_RULES } from "@/lib/mock-data";

// In-memory store for mock mode
let mockRules = [...MOCK_ALERT_RULES];
let nextId = 100;

export async function GET() {
    return NextResponse.json({ rules: mockRules });
}

export async function POST(request) {
    const body = await request.json();

    const newRule = {
        _id: `rule-${nextId++}`,
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
        triggerCount: 0,
        lastTriggered: null,
        createdAt: new Date().toISOString(),
    };

    mockRules.unshift(newRule);
    return NextResponse.json({ rule: newRule }, { status: 201 });
}
