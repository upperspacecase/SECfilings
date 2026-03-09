"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import FilingsFeed from "./components/FilingsFeed";
import AlertRulesPanel from "./components/AlertRulesPanel";
import AlertRuleModal from "./components/AlertRuleModal";

export default function DashboardClient() {
    const [activeTab, setActiveTab] = useState("filings");
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [rulesRefreshKey, setRulesRefreshKey] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    function handleTabChange(tab) {
        setActiveTab(tab);
        setSidebarOpen(false);
    }

    return (
        <div className="min-h-screen flex">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                mobileOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 lg:ml-[260px] min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 glass border-b border-[var(--color-border-subtle)] px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden btn btn-ghost btn-sm !p-1.5"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-base sm:text-lg font-semibold">
                            {activeTab === "filings" ? "Live Filings Feed" : "Alert Rules"}
                        </h1>
                        {activeTab === "filings" && (
                            <span className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--color-success)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pulse-live" />
                                Live
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {activeTab === "rules" && (
                            <button onClick={handleNewRule} className="btn btn-primary btn-sm text-xs sm:text-sm">
                                + New Rule
                            </button>
                        )}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            D
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8">
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
