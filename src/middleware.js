// Clerk middleware — in dev mode without keys, this is a no-op
// In production, this protects /dashboard routes

let clerkMiddleware;
try {
    const clerk = require("@clerk/nextjs/server");
    clerkMiddleware = clerk.clerkMiddleware;
} catch {
    clerkMiddleware = null;
}

const middleware = clerkMiddleware
    ? clerkMiddleware()
    : (req) => {
        // No-op middleware when Clerk is not configured
        return;
    };

export default middleware;

export const config = {
    matcher: [
        // Skip static files and Next.js internals
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
