import mongoose from "mongoose";

const AlertLogSchema = new mongoose.Schema(
    {
        alertRuleId: { type: mongoose.Schema.Types.ObjectId, ref: "AlertRule", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        filingId: { type: mongoose.Schema.Types.ObjectId, ref: "Filing", required: true },
        sentAt: { type: Date, default: Date.now },
        channel: { type: String, enum: ["email", "webhook"], default: "email" },
    },
    { timestamps: true }
);

AlertLogSchema.index({ userId: 1, sentAt: -1 });

export default mongoose.models.AlertLog || mongoose.model("AlertLog", AlertLogSchema);
