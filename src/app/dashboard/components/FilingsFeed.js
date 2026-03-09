"use client";

import { useState, useEffect, useCallback } from "react";
import { SIC_CODES, US_STATES } from "@/lib/mock-data";

export default function FilingsFeed() {
    const [filings, setFilings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [expandedId, setExpandedId] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [sicFilter, setSicFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");

    const fetchFilings = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (sicFilter) params.set("sicCode", sicFilter);
        if (stateFilter) params.set("state", stateFilter);
        if (minAmount) params.set("minAmount", minAmount);
        if (maxAmount) params.set("maxAmount", maxAmount);

        try {
            const res = await fetch(`/api/filings?${params}`);
            const data = await res.json();
            setFilings(data.filings || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch filings:", err);
        } finally {
            setLoading(false);
        }
    }, [search, sicFilter, stateFilter, minAmount, maxAmount]);

    useEffect(() => {
        fetchFilings();
        const interval = setInterval(fetchFilings, 30000);
        return () => clearInterval(interval);
    }, [fetchFilings]);

    function formatAmount(n) {
        if (n == null) return "—";
        if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
        if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
        return `$${n.toLocaleString()}`;
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Filters bar */}
            <div className="card !p-3 sm:!p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                        <input
                            type="text"
                            className="input"
                            placeholder="Search entity or person name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchFilings()}
                        />
                    </div>
                    <select
                        className="select w-full"
                        value={sicFilter}
                        onChange={(e) => setSicFilter(e.target.value)}
                    >
                        <option value="">All SIC Codes</option>
                        {Object.entries(SIC_CODES).map(([code, name]) => (
                            <option key={code} value={code}>
                                {code} — {name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select w-full"
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                    >
                        <option value="">All States</option>
                        {US_STATES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <button onClick={fetchFilings} className="btn btn-primary">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                    </button>
                </div>

                {/* Amount range */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                    <span className="text-xs text-[var(--color-text-muted)] shrink-0">Offering:</span>
                    <input
                        type="number"
                        className="input !w-28 sm:!w-36"
                        placeholder="Min $"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                    />
                    <span className="text-[var(--color-text-muted)]">—</span>
                    <input
                        type="number"
                        className="input !w-28 sm:!w-36"
                        placeholder="Max $"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                    />
                </div>
            </div>

            {/* Results header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span className="text-sm text-[var(--color-text-muted)]">
                    {total} filing{total !== 1 ? "s" : ""} found
                </span>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pulse-live" />
                    Auto-refreshing every 30s
                </span>
            </div>

            {/* Filings list */}
            {loading && filings.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filings.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-[var(--color-text-secondary)]">No filings match your filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filings.map((filing, i) => (
                        <div
                            key={filing._id || i}
                            className="card cursor-pointer slide-in"
                            style={{ animationDelay: `${i * 40}ms` }}
                            onClick={() =>
                                setExpandedId(expandedId === filing._id ? null : filing._id)
                            }
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold truncate">
                                            {filing.entityName}
                                        </h3>
                                        <span className="badge badge-accent shrink-0">
                                            {filing.formType}
                                        </span>
                                        {filing.isPooledInvestmentFund && (
                                            <span className="badge badge-muted shrink-0">Fund</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                                        <span>{filing.industryGroupType || filing.sicCode}</span>
                                        <span className="hidden sm:inline">·</span>
                                        <span>{filing.stateOfIncorporation}</span>
                                        <span className="hidden sm:inline">·</span>
                                        <span className="font-medium text-[var(--color-text-primary)]">
                                            {formatAmount(filing.totalOfferingAmount)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-medium text-[var(--color-accent)]">
                                        {timeAgo(filing.filedAt)}
                                    </div>
                                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                        {new Date(filing.filedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {expandedId === filing._id && (
                                <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] fade-in">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <DetailItem label="CIK" value={filing.cik} />
                                        <DetailItem label="SIC Code" value={filing.sicCode} />
                                        <DetailItem label="Entity Type" value={filing.entityType} />
                                        <DetailItem
                                            label="Total Offered"
                                            value={formatAmount(filing.totalOfferingAmount)}
                                        />
                                        <DetailItem
                                            label="Amount Sold"
                                            value={formatAmount(filing.totalAmountSold)}
                                        />
                                        <DetailItem
                                            label="Remaining"
                                            value={formatAmount(filing.totalRemaining)}
                                        />
                                        <DetailItem
                                            label="Min Investment"
                                            value={formatAmount(filing.minimumInvestmentAccepted)}
                                        />
                                        <DetailItem
                                            label="States"
                                            value={
                                                filing.statesOfSolicitation?.join(", ") || "—"
                                            }
                                        />
                                    </div>

                                    {/* Related Persons */}
                                    {filing.relatedPersons?.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                                                Related Persons
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {filing.relatedPersons.map((p, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="tag"
                                                    >
                                                        {p.firstName} {p.lastName}
                                                        <span className="text-[10px] opacity-60 ml-1">
                                                            {p.relationship?.join(", ")}
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* EDGAR link */}
                                    {filing.edgarUrl && (
                                        <div className="mt-4 flex justify-end">
                                            <a
                                                href={filing.edgarUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View on EDGAR →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <div className="text-xs text-[var(--color-text-muted)] mb-0.5">
                {label}
            </div>
            <div className="font-medium">{value || "—"}</div>
        </div>
    );
}
