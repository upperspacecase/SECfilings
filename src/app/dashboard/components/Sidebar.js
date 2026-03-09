"use client";

import Link from "next/link";

export default function Sidebar({ activeTab, onTabChange, mobileOpen, onClose }) {
    return (
        <aside
            className={`fixed left-0 top-0 bottom-0 w-[260px] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-subtle)] flex flex-col z-50 transition-transform duration-200 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
        >
            {/* Logo */}
            <div className="px-6 h-16 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        FP
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        Filing<span className="text-[var(--color-accent)]">Pulse</span>
                    </span>
                </Link>
                {/* Mobile close */}
                <button
                    onClick={onClose}
                    className="lg:hidden btn btn-ghost btn-sm !p-1"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <SidebarItem
                    icon={
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    label="Filings Feed"
                    active={activeTab === "filings"}
                    onClick={() => onTabChange("filings")}
                />
                <SidebarItem
                    icon={
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    }
                    label="Alert Rules"
                    active={activeTab === "rules"}
                    onClick={() => onTabChange("rules")}
                    badge="3"
                />
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-[var(--color-border-subtle)]">
                <div className="card !p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="badge badge-accent text-[10px]">PRO</span>
                        <span className="text-xs text-[var(--color-text-muted)]">$700/mo</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        Unlimited rules · Real-time alerts
                    </p>
                </div>
            </div>
        </aside>
    );
}

function SidebarItem({ icon, label, active, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${active
                    ? "bg-[var(--color-accent-glow)] text-[var(--color-accent)] border border-indigo-500/20"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] border border-transparent"
                }`}
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className="text-[10px] font-semibold bg-[var(--color-accent-glow)] text-[var(--color-accent)] px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}
