"use client";

import { useState, useEffect } from "react";

export default function AlertRulesPanel({ onNewRule, onEditRule }) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRules();
    }, []);

    async function fetchRules() {
        try {
            const res = await fetch("/api/alert-rules");
            const data = await res.json();
            setRules(data.rules || []);
        } catch (err) {
            console.error("Failed to fetch rules:", err);
        } finally {
            setLoading(false);
        }
    }

    async function toggleRule(rule) {
        try {
            await fetch(`/api/alert-rules/${rule._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !rule.enabled }),
            });
            setRules((prev) =>
                prev.map((r) =>
                    r._id === rule._id ? { ...r, enabled: !r.enabled } : r
                )
            );
        } catch (err) {
            console.error("Failed to toggle rule:", err);
        }
    }

    async function deleteRule(ruleId) {
        try {
            await fetch(`/api/alert-rules/${ruleId}`, { method: "DELETE" });
            setRules((prev) => prev.filter((r) => r._id !== ruleId));
        } catch (err) {
            console.error("Failed to delete rule:", err);
        }
    }

    function formatFilterSummary(filters) {
        const parts = [];
        if (filters.sicCodes?.length) parts.push(`SIC: ${filters.sicCodes.join(", ")}`);
        if (filters.states?.length) parts.push(`States: ${filters.states.join(", ")}`);
        if (filters.minOfferingAmount != null) parts.push(`Min: $${(filters.minOfferingAmount / 1e6).toFixed(0)}M`);
        if (filters.maxOfferingAmount != null) parts.push(`Max: $${(filters.maxOfferingAmount / 1e6).toFixed(0)}M`);
        if (filters.watchlistCompanies?.length) parts.push(`Companies: ${filters.watchlistCompanies.join(", ")}`);
        if (filters.watchlistPersons?.length) parts.push(`Persons: ${filters.watchlistPersons.join(", ")}`);
        return parts.length > 0 ? parts.join(" · ") : "No filters (matches all filings)";
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-[var(--color-accent)]">{rules.length}</div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">Total Rules</div>
                </div>
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-[var(--color-success)]">
                        {rules.filter((r) => r.enabled).length}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">Active</div>
                </div>
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-[var(--color-warning)]">
                        {rules.reduce((sum, r) => sum + (r.triggerCount || 0), 0)}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">Total Alerts Sent</div>
                </div>
            </div>

            {/* Rules list */}
            {rules.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="text-4xl mb-4">🔔</div>
                    <h3 className="text-lg font-semibold mb-2">No alert rules yet</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                        Create your first rule to get notified when matching Form D filings are published.
                    </p>
                    <button onClick={onNewRule} className="btn btn-primary">
                        + Create First Rule
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {rules.map((rule, i) => (
                        <div
                            key={rule._id}
                            className={`card slide-in ${!rule.enabled ? "opacity-50" : ""
                                }`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold">{rule.name}</h3>
                                        <span
                                            className={`badge ${rule.enabled ? "badge-success" : "badge-muted"
                                                }`}
                                        >
                                            {rule.enabled ? "Active" : "Paused"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                        {formatFilterSummary(rule.filters)}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                                        <span>
                                            Triggered {rule.triggerCount || 0} time{rule.triggerCount !== 1 ? "s" : ""}
                                        </span>
                                        {rule.lastTriggered && (
                                            <>
                                                <span>·</span>
                                                <span>
                                                    Last: {new Date(rule.lastTriggered).toLocaleDateString()}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Toggle */}
                                    <label className="toggle-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={rule.enabled}
                                            onChange={() => toggleRule(rule)}
                                        />
                                        <span className="toggle-track" />
                                    </label>

                                    {/* Edit */}
                                    <button
                                        onClick={() => onEditRule(rule)}
                                        className="btn btn-ghost btn-sm"
                                        title="Edit rule"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => deleteRule(rule._id)}
                                        className="btn btn-ghost btn-sm text-[var(--color-danger)] hover:bg-red-500/10"
                                        title="Delete rule"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
