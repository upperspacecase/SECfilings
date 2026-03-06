import { NextResponse } from "next/server";

export async function POST(request) {
    // In production: verify Stripe signature, handle subscription events
    return NextResponse.json({ received: true });
}
