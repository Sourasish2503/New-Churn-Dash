"use client";
import type { CohortRow } from "@/types";

function heatColor(pct: number) {
  if (pct >= 80) return "bg-violet-500/80 text-white";
  if (pct >= 60) return "bg-violet-500/50 text-white";
  if (pct >= 40) return "bg-violet-500/30 text-violet-200";
  if (pct >= 20) return "bg-violet-500/15 text-violet-300";
  if (pct >  0)  return "bg-violet-500/8 text-violet-400";
  return "bg-transparent text-[#444]";
}

export default function RetentionMatrix({ rows }: { rows: CohortRow[] }) {
  if (!rows.length) return (
    <div className="flex items-center justify-center py-24 text-[#888] text-sm">
      No cohort data yet — members will appear as they sign up.
    </div>
  );

  const maxOffset = Math.max(...rows.map(r => r.cells.length)) - 1;

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 overflow-x-auto">
      <h2 className="text-[#f5f5f5] font-semibold text-sm mb-1">Signup Cohort Retention</h2>
      <p className="text-[#888] text-xs mb-5">% of members still active N months after signup</p>
      <table className="text-xs border-collapse min-w-full">
        <thead>
          <tr>
            <th className="text-left text-[#888] font-medium py-2 pr-4">Cohort</th>
            <th className="text-right text-[#888] font-medium py-2 px-3">Size</th>
            {Array.from({ length: maxOffset + 1 }, (_, i) => (
              <th key={i} className="text-center text-[#888] font-medium py-2 px-2">M{i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.cohortMonth} className="border-t border-[#2a2a2a]/50">
              <td className="text-[#f5f5f5] py-2 pr-4 font-medium whitespace-nowrap">{row.cohortLabel}</td>
              <td className="text-[#888] text-right py-2 px-3 tabular-nums">{row.total}</td>
              {Array.from({ length: maxOffset + 1 }, (_, i) => {
                const cell = row.cells[i];
                if (!cell) return <td key={i} className="py-2 px-2 text-center text-[#444]">—</td>;
                return (
                  <td key={i} title={`${cell.retained}/${cell.total} (${cell.pct}%)`}
                    className={`py-2 px-2 text-center tabular-nums rounded ${heatColor(cell.pct)}`}>
                    {cell.pct}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}