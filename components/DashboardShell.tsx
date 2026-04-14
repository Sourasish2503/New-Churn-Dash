"use client";
import { useState } from "react";
import { BarChart2, Users, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import type { CachedSnapshot } from "@/types";
import KPICards from "./KPICards";
import RetentionMatrix from "./RetentionMatrix";
import ChurnChart from "./ChurnChart";
import AtRiskTable from "./AtRiskTable";

type Tab = "overview" | "retention" | "churn" | "at-risk";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",   label: "Overview",       icon: <BarChart2 className="w-4 h-4" /> },
  { id: "retention",  label: "Retention",      icon: <Users className="w-4 h-4" /> },
  { id: "churn",      label: "Churn Analysis", icon: <TrendingDown className="w-4 h-4" /> },
  { id: "at-risk",    label: "At Risk",        icon: <AlertTriangle className="w-4 h-4" /> },
];

interface Props {
  companyId:  string;
  snapshot:   CachedSnapshot;
  fetchedAt:  number;
}

export default function DashboardShell({ companyId, snapshot, fetchedAt }: Props) {
  const [activeTab,    setActiveTab]    = useState<Tab>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lastUpdated = new Date(fetchedAt).toLocaleTimeString("en-US", {
    hour:   "2-digit",
    minute: "2-digit",
  });

  function handleRefresh() {
    setIsRefreshing(true);
    window.location.href = `/dashboard/${companyId}?refresh=1`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-[#2a2a2a] bg-[#111] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <svg aria-label="Cohort Dashboard" viewBox="0 0 32 32" fill="none" className="w-7 h-7">
            <rect width="32" height="32" rx="8" fill="#8b5cf6" fillOpacity="0.15" />
            <rect x="6"  y="18" width="4" height="8"  rx="1" fill="#8b5cf6" />
            <rect x="12" y="12" width="4" height="14" rx="1" fill="#8b5cf6" fillOpacity="0.8" />
            <rect x="18" y="8"  width="4" height="18" rx="1" fill="#8b5cf6" fillOpacity="0.6" />
            <rect x="24" y="4"  width="4" height="22" rx="1" fill="#8b5cf6" fillOpacity="0.4" />
          </svg>
          <div>
            <h1 className="text-[#f5f5f5] font-semibold text-sm leading-tight">
              Cohort Dashboard
            </h1>
            <p className="text-[#888] text-xs">
              {snapshot.memberCount.toLocaleString()} members · Updated {lastUpdated}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh dashboard data"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888] hover:text-[#f5f5f5]
                     bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {/* ── Tab Bar ── */}
      <nav
        role="tablist"
        aria-label="Dashboard sections"
        className="flex gap-1 px-6 pt-4 border-b border-[#2a2a2a] bg-[#111]"
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg
                        border-b-2 transition-colors
                        ${activeTab === tab.id
                          ? "border-violet-500 text-[#f5f5f5]"
                          : "border-transparent text-[#888] hover:text-[#f5f5f5]"}`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "at-risk" && snapshot.kpis.atRiskCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded-full tabular-nums">
                {snapshot.kpis.atRiskCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto p-6">

        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <KPICards kpis={snapshot.kpis} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChurnChart
                velocity={snapshot.churnVelocity}
                reasons={snapshot.cancelReasons}
                compact
              />
              <AtRiskTable members={snapshot.atRisk} compact />
            </div>
            <RetentionMatrix rows={snapshot.cohortRows} />
          </div>
        )}

        {activeTab === "retention" && (
          <RetentionMatrix rows={snapshot.cohortRows} />
        )}

        {activeTab === "churn" && (
          <ChurnChart
            velocity={snapshot.churnVelocity}
            reasons={snapshot.cancelReasons}
          />
        )}

        {activeTab === "at-risk" && (
          <AtRiskTable members={snapshot.atRisk} />
        )}

      </main>
    </div>
  );
}