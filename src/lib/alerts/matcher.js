/**
 * Match new filings against alert rules.
 * @param {object[]} filings - Array of new Filing documents
 * @param {object[]} rules - Array of AlertRule documents (with filters)
 * @returns {Array<{ rule: object, matchedFilings: object[] }>}
 */
export function matchFilingsToRules(filings, rules) {
    const results = [];

    for (const rule of rules) {
        if (!rule.enabled) continue;

        const matched = filings.filter((filing) => matchesSingleRule(filing, rule));
        if (matched.length > 0) {
            results.push({ rule, matchedFilings: matched });
        }
    }

    return results;
}

function matchesSingleRule(filing, rule) {
    const f = rule.filters || {};

    // SIC code filter
    if (f.sicCodes && f.sicCodes.length > 0) {
        if (!f.sicCodes.includes(filing.sicCode)) return false;
    }

    // State filter — filing must solicit in at least one of the watched states
    if (f.states && f.states.length > 0) {
        const filingStates = filing.statesOfSolicitation || [];
        const hasOverlap = f.states.some((s) => filingStates.includes(s));
        if (!hasOverlap) return false;
    }

    // Offering amount range
    if (f.minOfferingAmount != null && filing.totalOfferingAmount != null) {
        if (filing.totalOfferingAmount < f.minOfferingAmount) return false;
    }
    if (f.maxOfferingAmount != null && filing.totalOfferingAmount != null) {
        if (filing.totalOfferingAmount > f.maxOfferingAmount) return false;
    }

    // Watchlist: company name (substring match, case-insensitive)
    if (f.watchlistCompanies && f.watchlistCompanies.length > 0) {
        const name = (filing.entityName || "").toLowerCase();
        const anyMatch = f.watchlistCompanies.some((w) =>
            name.includes(w.toLowerCase())
        );
        if (!anyMatch) return false;
    }

    // Watchlist: person name (substring match)
    if (f.watchlistPersons && f.watchlistPersons.length > 0) {
        const persons = (filing.relatedPersons || []).map(
            (p) => `${p.firstName} ${p.lastName}`.toLowerCase()
        );
        const anyMatch = f.watchlistPersons.some((w) =>
            persons.some((p) => p.includes(w.toLowerCase()))
        );
        if (!anyMatch) return false;
    }

    return true;
}
