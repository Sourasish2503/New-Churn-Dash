"use client";
import { AlertTriangle } from "lucide-react";
import type { AtRiskMember } from "@/types";

const BADGE: Record<AtRiskMember["status"], { label: string; cls: string }> = {
  past_due:      { label: "Past Due",    cls: "bg-red-500/20 text-red-400" },
  canceling:     { label: "Canceling",   cls: "bg-amber-500/20 text-amber-400" },
  canceling_eop: { label: "Cancels EOP", cls: "bg-orange-500/20 text-orange-400" },
};

export default function AtRiskTable({ members, compact }: { members: AtRiskMember[]; compact?: boolean }) {
  const rows = compact ? members.slice(0, 8) : members;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[#f5f5f5] font-semibold text-sm">At-Risk Members</h2>
          <p className="text-[#888] text-xs mt-0.5">Past due · canceling · cancel at period end</p>
        </div>
        {members.length > 0 && <span className="px-2 py-1 text-xs bg-red-500/15 text-red-400 rounded-full">{members.length} members</span>}
      </div>
      {rows.length === 0
        ? <div className="flex flex-col items-center justify-center py-10 text-[#888] gap-2">
            <AlertTriangle className="w-6 h-6 opacity-30" />
            <p className="text-xs">No at-risk members — great retention!</p>
          </div>
        : <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left text-[#888] font-medium py-2 pr-3">Member</th>
                  <th className="text-left text-[#888] font-medium py-2 px-2">Status</th>
                  <th className="text-right text-[#888] font-medium py-2 px-2">Tenure</th>
                  <th className="text-right text-[#888] font-medium py-2 px-2">LTV</th>
                  <th className="text-right text-[#888] font-medium py-2 pl-2">Renews</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(m => (
                  <tr key={m.userId} className="border-t border-[#2a2a2a]/40 hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-2.5 pr-3">
                      <p className="text-[#f5f5f5] font-medium truncate max-w-[120px]">{m.username ?? "Unknown"}</p>
                      {m.planTitle && <p className="text-[#444] truncate max-w-[120px]">{m.planTitle}</p>}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[m.status].cls}`}>{BADGE[m.status].label}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#888] tabular-nums">{m.tenureDays}d</td>
                    <td className="py-2.5 px-2 text-right text-[#f5f5f5] tabular-nums font-medium">${m.totalSpendUsd.toLocaleString()}</td>
                    <td className="py-2.5 pl-2 text-right text-[#888] tabular-nums">
                      {m.renewalPeriodEnd ? new Date(m.renewalPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {compact && members.length > 8 && <p className="text-center text-[#444] text-xs mt-3">+{members.length - 8} more — view At Risk tab</p>}
          </div>
      }
    </div>
  );
}