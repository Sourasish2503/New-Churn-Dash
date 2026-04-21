import type { MemberRecord, MembershipStatus, CancelOption } from "@/types";

export const STALE_MS = 15 * 60 * 1000;
const PAGE_SIZE = 50;

// Calls the Whop REST API directly using the app API key.
// The SDK's memberships.list requires a special scope that isn't available
// in the app portal — the direct REST call works with WHOP_API_KEY.
async function whopFetch(path: string) {
  const res = await fetch(`https://api.whop.com${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Whop API ${path} → ${res.status}: ${body}`);
  }
  return res.json();
}

export async function fetchAllMembers(companyId: string): Promise<MemberRecord[]> {
  const records: MemberRecord[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && records.length < 10_000) {
    const data = await whopFetch(
      `/v2/companies/${companyId}/memberships?page=${page}&per_page=${PAGE_SIZE}&expand[]=user&expand[]=plan&expand[]=product&expand[]=promo_code`
    );

    const nodes: Record<string, unknown>[] = data?.data ?? [];
    const pagination = data?.pagination ?? {};

    for (const m of nodes) {
      const user        = (m.user        as Record<string, unknown>) ?? {};
      const plan        = (m.plan        as Record<string, unknown>) ?? {};
      const product     = (m.product     as Record<string, unknown>) ?? {};
      const promoCode   = (m.promo_code  as Record<string, unknown>) ?? {};

      const createdMs  = m.created_at           ? new Date(m.created_at as string).getTime()           : Date.now();
      const canceledMs = m.canceled_at          ? new Date(m.canceled_at as string).getTime()          : null;
      const renewStart = m.renewal_period_start  ? new Date(m.renewal_period_start as string).getTime() : null;
      const renewEnd   = m.renewal_period_end    ? new Date(m.renewal_period_end as string).getTime()   : null;

      records.push({
        id:                 (m.id                  as string) ?? "",
        userId:             (user.id               as string) ?? "",
        username:           (user.username         as string) ?? null,
        email:              (user.email            as string) ?? null,
        status:             (m.status              as MembershipStatus),
        createdAt:          createdMs,
        canceledAt:         canceledMs,
        cancelOption:       ((m.cancel_option      as CancelOption) ?? null),
        cancellationReason: (m.cancellation_reason as string) ?? null,
        planId:             (plan.id               as string) ?? null,
        planTitle:          (plan.title            as string) ?? null,
        productId:          (product.id            as string) ?? null,
        productTitle:       (product.title         as string) ?? null,
        totalSpendUsd:      0,
        promoCodeId:        (promoCode.id          as string) ?? null,
        renewalPeriodStart: renewStart,
        renewalPeriodEnd:   renewEnd,
        cancelAtPeriodEnd:  (m.cancel_at_period_end as boolean) ?? false,
      });
    }

    // Whop REST pagination: next_page is null when done
    hasMore = !!pagination.next_page;
    page++;
  }

  console.log(`[whop-fetcher] fetched ${records.length} members for ${companyId}`);
  return records;
}
