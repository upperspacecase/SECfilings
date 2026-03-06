import { NextResponse } from "next/server";

export async function POST(request) {
    // In production: verify Clerk webhook, create User doc in MongoDB
    return NextResponse.json({ received: true });
}
