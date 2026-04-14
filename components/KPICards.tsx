"use client";
import { Users, TrendingDown, AlertTriangle, Clock, DollarSign, Activity } from "lucide-react";
import type { DashboardKPIs } from "@/types";

export default function KPICards({ kpis }: { kpis: DashboardKPIs }) {
  const cards = [
    { label: "Total Members",      value: kpis.totalMembers.toLocaleString(),  sub: `${kpis.activeMembers.toLocaleString()} active`,           icon: <Users className="w-5 h-5" />,         accent: "text-violet-400" },
    { label: "Churned This Month", value: kpis.churnedThisMonth.toLocaleString(), sub: kpis.totalMembers > 0 ? `${Math.round((kpis.churnedThisMonth/kpis.totalMembers)*100)}% of total` : "—", icon: <TrendingDown className="w-5 h-5" />,  accent: "text-red-400" },
    { label: "At Risk",            value: kpis.atRiskCount.toLocaleString(),    sub: "past due or canceling",                                   icon: <AlertTriangle className="w-5 h-5" />, accent: "text-amber-400" },
    { label: "Avg Tenure",         value: `${kpis.avgTenureDays}d`,             sub: "churned members",                                         icon: <Clock className="w-5 h-5" />,         accent: "text-blue-400" },
    { label: "Active Members",     value: kpis.activeMembers.toLocaleString(),  sub: kpis.totalMembers > 0 ? `${Math.round((kpis.activeMembers/kpis.totalMembers)*100)}% retention` : "—",   icon: <Activity className="w-5 h-5" />,      accent: "text-green-400" },
    { label: "Est. MRR",           value: `$${kpis.mrr.toLocaleString()}`,      sub: "active subscribers",                                      icon: <DollarSign className="w-5 h-5" />,    accent: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3 hover:border-[#444] transition-colors">
          <div className={c.accent}>{c.icon}</div>
          <div>
            <p className="text-[#f5f5f5] text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="text-[#888] text-xs mt-0.5">{c.label}</p>
            <p className="text-[#444] text-xs mt-0.5">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}