import mongoose from "mongoose";

const FilingSchema = new mongoose.Schema(
    {
        accessionNumber: { type: String, required: true, unique: true, index: true },
        cik: { type: String, required: true, index: true },
        entityName: { type: String, required: true },
        entityType: { type: String },
        sicCode: { type: String, index: true },
        industryGroupType: { type: String },
        stateOfIncorporation: { type: String },
        statesOfSolicitation: [{ type: String }],
        totalOfferingAmount: { type: Number },
        totalAmountSold: { type: Number },
        totalRemaining: { type: Number },
        minimumInvestmentAccepted: { type: Number },
        isEquityType: { type: Boolean },
        isDebtType: { type: Boolean },
        isPooledInvestmentFund: { type: Boolean },
        relatedPersons: [
            {
                firstName: String,
                lastName: String,
                relationship: [String],
            },
        ],
        filedAt: { type: Date, required: true, index: true },
        formType: { type: String, enum: ["D", "D/A"], default: "D" },
        rawXmlUrl: { type: String },
        edgarUrl: { type: String },
    },
    { timestamps: true }
);

FilingSchema.index({ sicCode: 1, filedAt: -1 });
FilingSchema.index({ statesOfSolicitation: 1, filedAt: -1 });
FilingSchema.index({ totalOfferingAmount: 1, filedAt: -1 });

export default mongoose.models.Filing || mongoose.model("Filing", FilingSchema);
