"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import type { ChurnVelocityPoint, CancelReasonStat } from "@/types";

const COLORS = ["#8b5cf6","#6366f1","#3b82f6","#22d3ee","#10b981","#f59e0b","#ef4444","#ec4899"];
const REASON_LABELS: Record<string, string> = {
  too_expensive: "Too Expensive", switching: "Switching", missing_features: "Missing Features",
  technical_issues: "Technical Issues", bad_experience: "Bad Experience", other: "Other",
  testing: "Testing", unknown: "Not Stated",
};
const TT = { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f5f5f5", fontSize: "12px" };

interface Props { velocity: ChurnVelocityPoint[]; reasons: CancelReasonStat[]; compact?: boolean; }

export default function ChurnChart({ velocity, reasons, compact }: Props) {
  const h = compact ? 160 : 240;
  const vData = velocity.map(v => ({ name: v.dayBucket === 0 ? "<1w" : `${v.dayBucket}d`, churned: v.count }));
  const rData = reasons.map((r, i) => ({ name: REASON_LABELS[r.reason] ?? r.reason, value: r.count, pct: r.pct, fill: COLORS[i % COLORS.length] }));

  return (
    <div className={`${compact ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
        <h2 className="text-[#f5f5f5] font-semibold text-sm mb-1">Churn Velocity</h2>
        <p className="text-[#888] text-xs mb-4">Days to churn after signup</p>
        {vData.length === 0
          ? <div className="flex items-center justify-center py-8 text-[#888] text-xs">No churn data yet</div>
          : <ResponsiveContainer width="100%" height={h}>
              <BarChart data={vData} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={TT} formatter={(v: number) => [`${v} members`, "Churned"]} />
                <Bar dataKey="churned" radius={[4,4,0,0]}>
                  {vData.map((_, i) => <Cell key={i} fill={COLORS[0]} fillOpacity={0.6 + i * 0.02} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        }
      </div>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
        <h2 className="text-[#f5f5f5] font-semibold text-sm mb-1">Cancel Reasons</h2>
        <p className="text-[#888] text-xs mb-4">Why members churned</p>
        {rData.length === 0
          ? <div className="flex items-center justify-center py-8 text-[#888] text-xs">No cancellation data yet</div>
          : <ResponsiveContainer width="100%" height={h}>
              <PieChart>
                <Pie data={rData} cx="45%" cy="50%" innerRadius={compact ? 36 : 55} outerRadius={compact ? 60 : 88} dataKey="value" paddingAngle={2}>
                  {rData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={(v: number, _: string, p: { payload?: { pct?: number } }) => [`${v} (${p?.payload?.pct ?? 0}%)`, "Members"]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: "#888", fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
        }
      </div>
    </div>
  );
}