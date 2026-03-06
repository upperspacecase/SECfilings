"use client";

import { useState } from "react";
import { SIC_CODES, US_STATES } from "@/lib/mock-data";

export default function AlertRuleModal({ rule, onClose, onSaved }) {
    const isEditing = !!rule;

    const [name, setName] = useState(rule?.name || "");
    const [sicCodes, setSicCodes] = useState(rule?.filters?.sicCodes || []);
    const [states, setStates] = useState(rule?.filters?.states || []);
    const [minAmount, setMinAmount] = useState(
        rule?.filters?.minOfferingAmount || ""
    );
    const [maxAmount, setMaxAmount] = useState(
        rule?.filters?.maxOfferingAmount || ""
    );
    const [watchCompanies, setWatchCompanies] = useState(
        (rule?.filters?.watchlistCompanies || []).join(", ")
    );
    const [watchPersons, setWatchPersons] = useState(
        (rule?.filters?.watchlistPersons || []).join(", ")
    );
    const [saving, setSaving] = useState(false);

    // SIC code add
    const [sicInput, setSicInput] = useState("");
    // State add
    const [stateInput, setStateInput] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name: name || "Untitled Rule",
            filters: {
                sicCodes,
                states,
                minOfferingAmount: minAmount ? Number(minAmount) : null,
                maxOfferingAmount: maxAmount ? Number(maxAmount) : null,
                watchlistCompanies: watchCompanies
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                watchlistPersons: watchPersons
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            },
        };

        try {
            if (isEditing) {
                await fetch(`/api/alert-rules/${rule._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch("/api/alert-rules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            onSaved();
        } catch (err) {
            console.error("Failed to save rule:", err);
        } finally {
            setSaving(false);
        }
    }

    function addSic() {
        if (sicInput && !sicCodes.includes(sicInput)) {
            setSicCodes([...sicCodes, sicInput]);
        }
        setSicInput("");
    }

    function removeSic(code) {
        setSicCodes(sicCodes.filter((c) => c !== code));
    }

    function addState() {
        if (stateInput && !states.includes(stateInput)) {
            setStates([...states, stateInput]);
        }
        setStateInput("");
    }

    function removeState(state) {
        setStates(states.filter((s) => s !== state));
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl fade-in">
                {/* Header */}
                <div className="sticky top-0 glass rounded-t-2xl border-b border-[var(--color-border-subtle)] px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg font-semibold">
                        {isEditing ? "Edit Rule" : "New Alert Rule"}
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rule name */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Rule Name
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder='e.g. "Large VC Funds in NY"'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* SIC Codes */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            SIC Codes
                        </label>
                        <div className="flex gap-2 mb-2">
                            <select
                                className="select flex-1"
                                value={sicInput}
                                onChange={(e) => setSicInput(e.target.value)}
                            >
                                <option value="">Select SIC code...</option>
                                {Object.entries(SIC_CODES).map(([code, label]) => (
                                    <option key={code} value={code}>
                                        {code} — {label}
                                    </option>
                                ))}
                            </select>
                            <button type="button" onClick={addSic} className="btn btn-secondary btn-sm">
                                Add
                            </button>
                        </div>
                        {sicCodes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {sicCodes.map((code) => (
                                    <span key={code} className="tag">
                                        {code} — {SIC_CODES[code] || "Unknown"}
                                        <button type="button" onClick={() => removeSic(code)}>
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* States */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            States of Solicitation
                        </label>
                        <div className="flex gap-2 mb-2">
                            <select
                                className="select flex-1"
                                value={stateInput}
                                onChange={(e) => setStateInput(e.target.value)}
                            >
                                <option value="">Select state...</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            <button type="button" onClick={addState} className="btn btn-secondary btn-sm">
                                Add
                            </button>
                        </div>
                        {states.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {states.map((s) => (
                                    <span key={s} className="tag">
                                        {s}
                                        <button type="button" onClick={() => removeState(s)}>
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Offering amount range */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Offering Amount Range
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                className="input"
                                placeholder="Min $"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                            />
                            <span className="text-[var(--color-text-muted)] shrink-0">to</span>
                            <input
                                type="number"
                                className="input"
                                placeholder="Max $"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Watchlist companies */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Watch Companies
                            <span className="text-xs text-[var(--color-text-muted)] ml-2">
                                (comma-separated)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Sequoia, Andreessen"
                            value={watchCompanies}
                            onChange={(e) => setWatchCompanies(e.target.value)}
                        />
                    </div>

                    {/* Watchlist persons */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Watch Persons
                            <span className="text-xs text-[var(--color-text-muted)] ml-2">
                                (comma-separated)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. John Smith, Jane Doe"
                            value={watchPersons}
                            onChange={(e) => setWatchPersons(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isEditing ? (
                                "Save Changes"
                            ) : (
                                "Create Rule"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
