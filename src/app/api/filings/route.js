import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Filing from "@/models/Filing";
import { MOCK_FILINGS } from "@/lib/mock-data";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sicCode = searchParams.get("sicCode");
    const state = searchParams.get("state");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Try MongoDB first, fall back to mock data
    const db = await connectDB();

    if (!db) {
        // Mock mode — filter in memory
        return serveMockFilings({
            sicCode,
            state,
            minAmount,
            maxAmount,
            search,
            page,
            limit,
        });
    }

    // Real MongoDB query
    const query = {};

    if (sicCode) {
        const codes = sicCode.split(",").filter(Boolean);
        if (codes.length) query.sicCode = { $in: codes };
    }

    if (state) {
        const states = state.split(",").filter(Boolean);
        if (states.length) query.statesOfSolicitation = { $in: states };
    }

    if (minAmount || maxAmount) {
        query.totalOfferingAmount = {};
        if (minAmount) query.totalOfferingAmount.$gte = parseFloat(minAmount);
        if (maxAmount) query.totalOfferingAmount.$lte = parseFloat(maxAmount);
    }

    if (search) {
        query.$or = [
            { entityName: { $regex: search, $options: "i" } },
            { "relatedPersons.firstName": { $regex: search, $options: "i" } },
            { "relatedPersons.lastName": { $regex: search, $options: "i" } },
        ];
    }

    try {
        const total = await Filing.countDocuments(query);
        const filings = await Filing.find(query)
            .sort({ filedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            filings,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error("MongoDB query error:", err.message);
        return serveMockFilings({
            sicCode,
            state,
            minAmount,
            maxAmount,
            search,
            page,
            limit,
        });
    }
}

function serveMockFilings({ sicCode, state, minAmount, maxAmount, search, page, limit }) {
    let filings = [...MOCK_FILINGS];

    if (sicCode) {
        const codes = sicCode.split(",");
        filings = filings.filter((f) => codes.includes(f.sicCode));
    }
    if (state) {
        const states = state.split(",");
        filings = filings.filter((f) =>
            f.statesOfSolicitation?.some((s) => states.includes(s))
        );
    }
    if (minAmount) {
        filings = filings.filter((f) => f.totalOfferingAmount >= parseFloat(minAmount));
    }
    if (maxAmount) {
        filings = filings.filter((f) => f.totalOfferingAmount <= parseFloat(maxAmount));
    }
    if (search) {
        const q = search.toLowerCase();
        filings = filings.filter(
            (f) =>
                f.entityName.toLowerCase().includes(q) ||
                f.relatedPersons?.some((p) =>
                    `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
                )
        );
    }

    filings.sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt));
    const total = filings.length;
    const start = (page - 1) * limit;
    const paged = filings.slice(start, start + limit);

    return NextResponse.json({ filings: paged, total, page, pages: Math.ceil(total / limit) });
}
