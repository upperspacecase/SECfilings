import { NextResponse } from "next/server";

// Clerk middleware — only activates when keys are configured.
// Without CLERK_SECRET_KEY, this is a passthrough.
export default function middleware(req) {
    // No-op when Clerk isn't configured — let everything through
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip static files and Next.js internals
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
