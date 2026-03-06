import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        clerkUserId: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true },
        name: { type: String, default: "" },
        stripeCustomerId: { type: String },
        subscriptionTier: {
            type: String,
            enum: ["free", "pro"],
            default: "free",
        },
        subscriptionStatus: {
            type: String,
            enum: ["active", "canceled", "past_due", "incomplete", "none"],
            default: "none",
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
