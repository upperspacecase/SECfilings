import { NextResponse } from "next/server";
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

    // In mock mode, filter from mock data
    // In production, this would query MongoDB
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
        filings = filings.filter(
            (f) => f.totalOfferingAmount >= parseFloat(minAmount)
        );
    }

    if (maxAmount) {
        filings = filings.filter(
            (f) => f.totalOfferingAmount <= parseFloat(maxAmount)
        );
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

    // Sort by filedAt desc
    filings.sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt));

    const total = filings.length;
    const start = (page - 1) * limit;
    const paged = filings.slice(start, start + limit);

    return NextResponse.json({
        filings: paged,
        total,
        page,
        pages: Math.ceil(total / limit),
    });
}
