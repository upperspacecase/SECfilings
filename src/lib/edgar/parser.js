import { parseStringPromise } from "xml2js";

/**
 * Parse Form D XML into a normalized filing object.
 * @param {string} xml - Raw XML string from EDGAR
 * @param {object} meta - Metadata from the EFTS search result (accessionNumber, filedAt, etc.)
 * @returns {object} Normalized filing object matching the Filing schema
 */
export async function parseFormDXml(xml, meta = {}) {
    const result = await parseStringPromise(xml, {
        explicitArray: false,
        ignoreAttrs: false,
        tagNameProcessors: [(name) => name.replace(/.*:/, "")],
    });

    const root =
        result.edgarSubmission ||
        result.offeringData ||
        result.primaryIssuer ||
        result;

    const issuer = root.primaryIssuer || root.issuer || {};
    const offering = root.offeringData || {};
    const amounts = offering.offeringSalesAmounts || {};
    const relatedPersons = extractRelatedPersons(root.relatedPersonsList);

    return {
        accessionNumber: meta.accessionNumber || "",
        cik: issuer.cik || meta.cik || "",
        entityName: issuer.entityName || meta.entityName || "",
        entityType: issuer.entityType || "",
        sicCode: issuer.industryGroup?.industryGroupType === "Other"
            ? issuer.industryGroup?.otherIndustry
            : "",
        industryGroupType: issuer.industryGroup?.industryGroupType || "",
        stateOfIncorporation:
            issuer.issuerAddress?.stateOrCountry ||
            issuer.stateOfIncorporation ||
            "",
        statesOfSolicitation: extractStates(
            offering.salesStateList || offering.offeringSalesState
        ),
        totalOfferingAmount: parseAmount(amounts.totalOfferingAmount),
        totalAmountSold: parseAmount(amounts.totalAmountSold),
        totalRemaining: parseAmount(amounts.totalRemaining),
        minimumInvestmentAccepted: parseAmount(offering.minimumInvestmentAccepted),
        isEquityType: offering.typeOfSecuritiesOffered?.isEquityType === "Y",
        isDebtType: offering.typeOfSecuritiesOffered?.isDebtType === "Y",
        isPooledInvestmentFund:
            offering.typeOfSecuritiesOffered?.isPooledInvestmentFundType === "Y",
        relatedPersons,
        filedAt: meta.filedAt ? new Date(meta.filedAt) : new Date(),
        formType: meta.formType || "D",
        rawXmlUrl: meta.rawXmlUrl || "",
        edgarUrl: meta.edgarUrl || "",
    };
}

function extractRelatedPersons(list) {
    if (!list) return [];
    const persons = Array.isArray(list.relatedPersonInfo)
        ? list.relatedPersonInfo
        : list.relatedPersonInfo
            ? [list.relatedPersonInfo]
            : [];
    return persons.map((p) => ({
        firstName: p.relatedPersonName?.firstName || "",
        lastName: p.relatedPersonName?.lastName || "",
        relationship: extractRelationships(p.relatedPersonRelationshipList),
    }));
}

function extractRelationships(rel) {
    if (!rel) return [];
    const out = [];
    if (rel.relationshipList || rel) {
        const r = rel.relationshipList || rel;
        if (r.isExecutiveOfficer === "Y") out.push("Executive Officer");
        if (r.isDirector === "Y") out.push("Director");
        if (r.isPromoter === "Y") out.push("Promoter");
    }
    return out;
}

function extractStates(stateData) {
    if (!stateData) return [];
    if (Array.isArray(stateData)) {
        return stateData.map(
            (s) => s.stateOrCountry || s.stateCode || s
        );
    }
    if (typeof stateData === "object") {
        return [stateData.stateOrCountry || stateData.stateCode || ""];
    }
    return [];
}

function parseAmount(val) {
    if (val === undefined || val === null || val === "") return null;
    const num = parseFloat(String(val).replace(/[,$]/g, ""));
    return isNaN(num) ? null : num;
}
