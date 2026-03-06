"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import FilingsFeed from "./components/FilingsFeed";
import AlertRulesPanel from "./components/AlertRulesPanel";
import AlertRuleModal from "./components/AlertRuleModal";

export default function DashboardClient() {
    const [activeTab, setActiveTab] = useState("filings"); // "filings" | "rules"
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [rulesRefreshKey, setRulesRefreshKey] = useState(0);

    function handleNewRule() {
        setEditingRule(null);
        setShowRuleModal(true);
    }

    function handleEditRule(rule) {
        setEditingRule(rule);
        setShowRuleModal(true);
    }

    function handleRuleSaved() {
        setShowRuleModal(false);
        setEditingRule(null);
        setRulesRefreshKey((k) => k + 1);
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 ml-[260px]">
                {/* Top bar */}
                <header className="sticky top-0 z-40 glass border-b border-[var(--color-border-subtle)] px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold">
                            {activeTab === "filings" ? "Live Filings Feed" : "Alert Rules"}
                        </h1>
                        {activeTab === "filings" && (
                            <span className="flex items-center gap-1.5 text-xs text-[var(--color-success)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pulse-live" />
                                Live
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeTab === "rules" && (
                            <button onClick={handleNewRule} className="btn btn-primary btn-sm">
                                + New Rule
                            </button>
                        )}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            D
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {activeTab === "filings" && <FilingsFeed />}
                    {activeTab === "rules" && (
                        <AlertRulesPanel
                            key={rulesRefreshKey}
                            onNewRule={handleNewRule}
                            onEditRule={handleEditRule}
                        />
                    )}
                </div>
            </main>

            {/* Rule modal */}
            {showRuleModal && (
                <AlertRuleModal
                    rule={editingRule}
                    onClose={() => {
                        setShowRuleModal(false);
                        setEditingRule(null);
                    }}
                    onSaved={handleRuleSaved}
                />
            )}
        </div>
    );
}
