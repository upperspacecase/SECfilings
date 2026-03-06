import { parseFormDXml } from "./parser";

const EFTS_BASE = "https://efts.sec.gov/LATEST/search-index";
const EDGAR_ARCHIVES = "https://www.sec.gov/Archives/edgar/data";
const USER_AGENT =
    process.env.EDGAR_USER_AGENT || "FilingPulse admin@filingpulse.com";

/**
 * Poll EDGAR for recent Form D filings.
 * Returns an array of normalized filing objects (new ones only).
 * @param {Set<string>} existingAccessions - Set of accession numbers already in our DB
 * @returns {Promise<object[]>}
 */
export async function pollEdgar(existingAccessions = new Set()) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().split("T")[0];

    const url = `${EFTS_BASE}?q=%22*%22&forms=D,D/A&dateRange=custom&startdt=${fmt(
        yesterday
    )}&enddt=${fmt(now)}&from=0&size=40`;

    const res = await fetch(url, {
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        console.error(`EFTS returned ${res.status}`);
        return [];
    }

    const data = await res.json();
    const hits = data.hits?.hits || data.hits || [];

    const newFilings = [];

    for (const hit of hits) {
        const source = hit._source || hit;
        const accession = source.file_num || source.accession_no || "";
        const cleaned = accession.replace(/-/g, "");

        if (existingAccessions.has(accession) || existingAccessions.has(cleaned)) {
            continue;
        }

        try {
            const xmlUrl = await resolveXmlUrl(source);
            if (!xmlUrl) continue;

            const xmlRes = await fetch(xmlUrl, {
                headers: { "User-Agent": USER_AGENT },
            });
            if (!xmlRes.ok) continue;

            const xml = await xmlRes.text();
            const filing = await parseFormDXml(xml, {
                accessionNumber: accession,
                filedAt: source.file_date || source.filing_date,
                formType: source.form_type || "D",
                rawXmlUrl: xmlUrl,
                cik: source.entity_id || source.cik || "",
                entityName: source.entity_name || source.display_names?.[0] || "",
                edgarUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${source.entity_id || source.cik || ""
                    }`,
            });

            newFilings.push(filing);
        } catch (err) {
            console.error(`Failed to parse filing ${accession}:`, err.message);
        }
    }

    return newFilings;
}

async function resolveXmlUrl(source) {
    const cik = source.entity_id || source.cik || "";
    const accession = (source.accession_no || "").replace(/-/g, "");
    if (!cik || !accession) return null;

    const indexUrl = `${EDGAR_ARCHIVES}/${cik}/${accession}/`;
    try {
        const res = await fetch(indexUrl, {
            headers: { "User-Agent": USER_AGENT },
        });
        if (!res.ok) return null;
        const html = await res.text();
        const match = html.match(/href="([^"]*primary_doc\.xml)"/i);
        if (match) return `${indexUrl}${match[1]}`;

        const xmlMatch = html.match(/href="([^"]*\.xml)"/i);
        return xmlMatch ? `${indexUrl}${xmlMatch[1]}` : null;
    } catch {
        return null;
    }
}
