export type MembershipStatus =
  | "trialing" | "active" | "past_due" | "completed"
  | "canceled" | "expired" | "unresolved" | "drafted" | "canceling";

export type CancelOption =
  | "too_expensive" | "switching" | "missing_features"
  | "technical_issues" | "bad_experience" | "other" | "testing";

export interface MemberRecord {
  id: string;
  userId: string;
  username: string | null;
  email: string | null;
  status: MembershipStatus;
  createdAt: number;
  canceledAt: number | null;
  cancelOption: CancelOption | null;
  cancellationReason: string | null;
  planId: string | null;
  planTitle: string | null;
  productId: string | null;
  productTitle: string | null;
  totalSpendUsd: number;
  promoCodeId: string | null;
  renewalPeriodStart: number | null;
  renewalPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

export interface CohortCell {
  cohortLabel: string;
  monthOffset: number;
  retained: number;
  total: number;
  pct: number;
}

export interface CohortRow {
  cohortLabel: string;
  cohortMonth: string;
  total: number;
  cells: CohortCell[];
}

export interface ChurnVelocityPoint {
  dayBucket: number;
  count: number;
  pct: number;
}

export interface CancelReasonStat {
  reason: CancelOption | "unknown";
  count: number;
  pct: number;
}

export interface AtRiskMember {
  userId: string;
  username: string | null;
  email: string | null;
  status: "past_due" | "canceling" | "canceling_eop";
  tenureDays: number;
  totalSpendUsd: number;
  planTitle: string | null;
  renewalPeriodEnd: number | null;
}

export interface DashboardKPIs {
  totalMembers: number;
  activeMembers: number;
  churnedThisMonth: number;
  atRiskCount: number;
  avgTenureDays: number;
  mrr: number;
}

export interface CachedSnapshot {
  companyId: string;
  fetchedAt: number;
  kpis: DashboardKPIs;
  cohortRows: CohortRow[];
  churnVelocity: ChurnVelocityPoint[];
  cancelReasons: CancelReasonStat[];
  atRisk: AtRiskMember[];
  memberCount: number;
}
