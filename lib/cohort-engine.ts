import type {
  MemberRecord, CohortRow, CohortCell,
  ChurnVelocityPoint, CancelReasonStat,
  AtRiskMember, DashboardKPIs,
} from "@/types";

function toMonthKey(unixMs: number): string {
  const d = new Date(unixMs);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function toMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleString("en-US", { month: "short", year: "numeric" });
}

function monthDiff(fromMs: number, toMs: number): number {
  const from = new Date(fromMs);
  const to   = new Date(toMs);
  return (to.getUTCFullYear() - from.getUTCFullYear()) * 12
       + (to.getUTCMonth()    - from.getUTCMonth());
}

const ACTIVE_STATUSES  = new Set(["active", "trialing", "canceling"]);
const AT_RISK_STATUSES = new Set(["past_due", "canceling"]);

export function computeKPIs(members: MemberRecord[]): DashboardKPIs {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const activeMembers    = members.filter(m => ACTIVE_STATUSES.has(m.status)).length;
  const churnedThisMonth = members.filter(m =>
    m.status === "canceled" && m.canceledAt !== null &&
    m.canceledAt >= startOfMonth.getTime()
  ).length;
  const atRiskCount = members.filter(m => AT_RISK_STATUSES.has(m.status)).length;

  const tenures = members
    .filter(m => m.status === "canceled" && m.canceledAt)
    .map(m => (m.canceledAt! - m.createdAt) / 86400000);

  const avgTenureDays = tenures.length > 0
    ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length) : 0;

  const mrr = Math.round(
    members.filter(m => m.status === "active")
      .reduce((sum, m) => sum + m.totalSpendUsd, 0)
  );

  return { totalMembers: members.length, activeMembers, churnedThisMonth, atRiskCount, avgTenureDays, mrr };
}

export function buildCohortMatrix(members: MemberRecord[]): CohortRow[] {
  const now    = Date.now();
  const groups = new Map<string, MemberRecord[]>();

  for (const m of members) {
    const key = toMonthKey(m.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return Array.from(groups.keys()).sort().map(cohortMonth => {
    const cohortMembers  = groups.get(cohortMonth)!;
    const total          = cohortMembers.length;
    const cohortStartMs  = new Date(cohortMonth + "-01").getTime();
    const maxOffset      = Math.min(monthDiff(cohortStartMs, now), 11);
    const cells: CohortCell[] = [];

    for (let offset = 0; offset <= maxOffset; offset++) {
      const windowEnd = new Date(
        new Date(cohortMonth + "-01").setUTCMonth(
          new Date(cohortMonth + "-01").getUTCMonth() + offset + 1
        )
      ).getTime();

      const retained = cohortMembers.filter(m => {
        if (ACTIVE_STATUSES.has(m.status)) return true;
        if (!m.canceledAt) return true;
        return m.canceledAt > windowEnd;
      }).length;

      cells.push({
        cohortLabel: toMonthLabel(cohortMonth),
        monthOffset: offset,
        retained,
        total,
        pct: total > 0 ? Math.round((retained / total) * 100) : 0,
      });
    }

    return { cohortLabel: toMonthLabel(cohortMonth), cohortMonth, total, cells };
  });
}

export function buildChurnVelocity(members: MemberRecord[]): ChurnVelocityPoint[] {
  const churned = members.filter(m => m.status === "canceled" && m.canceledAt !== null);
  const total   = churned.length;
  if (total === 0) return [];

  const BUCKETS = [0, 7, 14, 30, 60, 90, 120, 180, 270, 365];
  const counts: Record<number, number> = {};
  for (const b of BUCKETS) counts[b] = 0;

  for (const m of churned) {
    const days = (m.canceledAt! - m.createdAt) / 86400000;
    let bucket = BUCKETS[BUCKETS.length - 1]!;
    for (const b of BUCKETS) { if (days <= b) { bucket = b; break; } }
    counts[bucket]++;
  }

  return BUCKETS.map(b => ({
    dayBucket: b,
    count: counts[b] ?? 0,
    pct: total > 0 ? Math.round(((counts[b] ?? 0) / total) * 100) : 0,
  }));
}

export function buildCancelReasons(members: MemberRecord[]): CancelReasonStat[] {
  const churned = members.filter(m => m.status === "canceled" || m.status === "canceling");
  const total   = churned.length;
  const counts  = new Map<string, number>();

  for (const m of churned) {
    const key = m.cancelOption ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({
      reason: reason as CancelReasonStat["reason"],
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

export function buildAtRisk(members: MemberRecord[]): AtRiskMember[] {
  return members
    .filter(m => AT_RISK_STATUSES.has(m.status) || m.cancelAtPeriodEnd)
    .map(m => {
      let atRiskStatus: AtRiskMember["status"];
      if (m.status === "past_due")       atRiskStatus = "past_due";
      else if (m.cancelAtPeriodEnd)      atRiskStatus = "canceling_eop";
      else                               atRiskStatus = "canceling";

      return {
        userId:           m.userId,
        username:         m.username,
        email:            m.email,
        status:           atRiskStatus,
        tenureDays:       Math.round((Date.now() - m.createdAt) / 86400000),
        totalSpendUsd:    m.totalSpendUsd,
        planTitle:        m.planTitle,
        renewalPeriodEnd: m.renewalPeriodEnd,
      };
    })
    .sort((a, b) => b.totalSpendUsd - a.totalSpendUsd);
}