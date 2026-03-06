import { NextResponse } from "next/server";

export async function POST(request) {
    // In production: authenticate user, create Stripe checkout session
    // For now, return a mock response
    return NextResponse.json({
        message: "Stripe not configured — add STRIPE_SECRET_KEY to .env.local",
        url: null,
    });
}
