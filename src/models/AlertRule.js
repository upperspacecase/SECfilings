import mongoose from "mongoose";

const AlertRuleSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        clerkUserId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        filters: {
            sicCodes: [{ type: String }],
            states: [{ type: String }],
            minOfferingAmount: { type: Number, default: null },
            maxOfferingAmount: { type: Number, default: null },
            watchlistCompanies: [{ type: String }],
            watchlistPersons: [{ type: String }],
        },
        lastTriggered: { type: Date, default: null },
        triggerCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.AlertRule || mongoose.model("AlertRule", AlertRuleSchema);
