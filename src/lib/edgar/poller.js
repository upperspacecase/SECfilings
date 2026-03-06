/**
 * EDGAR Poller — fetches recent Form D filings from SEC EDGAR EFTS
 *
 * Uses the EFTS search-index endpoint:
 *   https://efts.sec.gov/LATEST/search-index?q=&forms=D
 *
 * Then optionally enriches each filing by fetching the Form D XML.
 */

const USER_AGENT =
    process.env.EDGAR_USER_AGENT || "FilingPulse admin@filingpulse.com";

/**
 * Poll EDGAR for new Form D filings
 * @param {Set<string>} existingAccessions - accession numbers already in DB
 * @returns {Array} Array of filing objects ready to insert into MongoDB
 */
export async function pollEdgar(existingAccessions = new Set()) {
    const filings = [];

    try {
        // Fetch latest Form D filings from EFTS (last 7 days by default)
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const startdt = weekAgo.toISOString().split("T")[0];
        const enddt = today.toISOString().split("T")[0];

        const url = `https://efts.sec.gov/LATEST/search-index?q=&forms=D&dateRange=custom&startdt=${startdt}&enddt=${enddt}`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": USER_AGENT,
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            console.error(`EFTS API error: ${res.status} ${res.statusText}`);
            return filings;
        }

        const data = await res.json();
        const hits = data.hits?.hits || [];

        console.log(
            `EFTS returned ${hits.length} filings (total: ${data.hits?.total?.value})`
        );

        for (const hit of hits) {
            const src = hit._source;
            const accessionNumber = src.adsh;

            // Skip if we already have this filing
            if (existingAccessions.has(accessionNumber)) {
                continue;
            }

            const cik = src.ciks?.[0] || "";
            const entityName =
                src.display_names?.[0]?.replace(/\s*\(CIK.*\)/, "") || "Unknown";

            // Build filing from EFTS data
            const filing = {
                accessionNumber,
                cik,
                entityName,
                formType: src.form || "D",
                filedAt: new Date(src.file_date),
                sicCode: src.sics?.[0] || null,
                stateOfIncorporation: src.inc_states?.[0] || null,
                statesOfSolicitation: src.biz_states || [],
                entityType: null,
                industryGroupType: null,
                totalOfferingAmount: null,
                totalAmountSold: null,
                totalRemaining: null,
                minimumInvestmentAccepted: null,
                isPooledInvestmentFund: false,
                relatedPersons: [],
                edgarUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=D&dateb=&owner=include&count=10`,
            };

            // Try to enrich with Form D XML
            try {
                const enriched = await enrichFromXml(accessionNumber, cik);
                if (enriched) {
                    Object.assign(filing, enriched);
                }
            } catch (err) {
                // XML enrichment is optional, continue with EFTS data
                console.warn(
                    `XML enrichment failed for ${accessionNumber}: ${err.message}`
                );
            }

            filings.push(filing);
        }
    } catch (err) {
        console.error("EDGAR poll failed:", err);
    }

    return filings;
}

/**
 * Fetch and parse the Form D XML for richer data
 */
async function enrichFromXml(accessionNumber, cik) {
    const adshNoDash = accessionNumber.replace(/-/g, "");
    const cleanCik = cik.replace(/^0+/, ""); // Strip leading zeros
    const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${adshNoDash}/primary_doc.xml`;

    const res = await fetch(xmlUrl, {
        headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) return null;

    const xml = await res.text();
    if (!xml.includes("<offeringData>") && !xml.includes("<edgarSubmission>")) {
        return null;
    }

    // Quick XML parsing without xml2js (regex-based for speed)
    const enriched = {};

    const getVal = (tag) => {
        const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
        return m ? m[1].trim() : null;
    };

    const totalOffering = getVal("totalOfferingAmount");
    if (totalOffering) enriched.totalOfferingAmount = parseFloat(totalOffering);

    const totalSold = getVal("totalAmountSold");
    if (totalSold) enriched.totalAmountSold = parseFloat(totalSold);

    const totalRemaining = getVal("totalRemaining");
    if (totalRemaining) enriched.totalRemaining = parseFloat(totalRemaining);

    const minInvestment = getVal("minimumInvestmentAccepted");
    if (minInvestment)
        enriched.minimumInvestmentAccepted = parseFloat(minInvestment);

    const isPooled = getVal("isPooledInvestmentFundType");
    enriched.isPooledInvestmentFund = isPooled === "Y";

    const entityType = getVal("entityType");
    if (entityType) enriched.entityType = entityType;

    const industryGroup = getVal("industryGroupType");
    if (industryGroup) enriched.industryGroupType = industryGroup;

    // Parse related persons
    const personMatches = xml.matchAll(
        /<relatedPersonInfo>([\s\S]*?)<\/relatedPersonInfo>/g
    );
    const persons = [];
    for (const m of personMatches) {
        const block = m[1];
        const get = (tag) => {
            const r = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
            return r ? r[1].trim() : null;
        };

        const firstName = get("relatedPersonName>first") || get("firstName");
        const lastName = get("relatedPersonName>last") || get("lastName");

        if (firstName || lastName) {
            const relationships = [];
            if (block.includes("<isDirector>true</isDirector>"))
                relationships.push("Director");
            if (block.includes("<isOfficer>true</isOfficer>"))
                relationships.push("Officer");
            if (block.includes("<isPromoter>true</isPromoter>"))
                relationships.push("Promoter");
            if (block.includes("<isTenPercentOwner>true</isTenPercentOwner>"))
                relationships.push("10% Owner");

            persons.push({ firstName, lastName, relationship: relationships });
        }
    }
    if (persons.length > 0) enriched.relatedPersons = persons;

    return enriched;
}
