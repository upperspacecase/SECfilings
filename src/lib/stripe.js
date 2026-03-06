import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export function getStripeOrWarn() {
    if (!stripe) {
        console.warn("⚠️  STRIPE_SECRET_KEY not set — Stripe is disabled");
    }
    return stripe;
}
