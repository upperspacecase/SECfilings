import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import AlertRule from "@/models/AlertRule";

export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    const db = await connectDB();

    if (!db) {
        return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
    }

    try {
        const rule = await AlertRule.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!rule) {
            return NextResponse.json({ error: "Rule not found" }, { status: 404 });
        }
        return NextResponse.json({ rule });
    } catch (err) {
        console.error("Failed to update rule:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const db = await connectDB();

    if (!db) {
        return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
    }

    try {
        const result = await AlertRule.findByIdAndDelete(id);
        if (!result) {
            return NextResponse.json({ error: "Rule not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Failed to delete rule:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
