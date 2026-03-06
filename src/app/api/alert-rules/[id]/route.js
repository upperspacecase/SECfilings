import { NextResponse } from "next/server";
import { MOCK_ALERT_RULES } from "@/lib/mock-data";

// Reference the same mock store (in real app this is MongoDB)
let mockRules = [...MOCK_ALERT_RULES];

export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();

    const idx = mockRules.findIndex((r) => r._id === id);
    if (idx === -1) {
        return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    mockRules[idx] = { ...mockRules[idx], ...body };
    return NextResponse.json({ rule: mockRules[idx] });
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const idx = mockRules.findIndex((r) => r._id === id);
    if (idx === -1) {
        return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    mockRules.splice(idx, 1);
    return NextResponse.json({ success: true });
}
