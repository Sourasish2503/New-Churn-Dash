import { whopsdk } from "@/lib/whop-sdk";
import type { MemberRecord, MembershipStatus, CancelOption } from "@/types";

export const STALE_MS = 15 * 60 * 1000;
const PAGE_SIZE = 50;

export async function fetchAllMembers(companyId: string): Promise<MemberRecord[]> {
  const records: MemberRecord[] = [];
  let after:  string | undefined = undefined;
  let hasMore = true;

  while (hasMore && records.length < 10_000) {
    const page = await whopsdk.memberships.list({
      company_id: companyId,
      first:      PAGE_SIZE,
      after:      after,
    });

    const nodes  = page.data;
    hasMore      = page.hasNextPage();
    const cursor = page.page_info?.end_cursor;

    for (const m of nodes) {
      const createdMs  = m.created_at           ? new Date(m.created_at).getTime()           : Date.now();
      const canceledMs = m.canceled_at          ? new Date(m.canceled_at).getTime()          : null;
      const renewStart = m.renewal_period_start ? new Date(m.renewal_period_start).getTime() : null;
      const renewEnd   = m.renewal_period_end   ? new Date(m.renewal_period_end).getTime()   : null;

      records.push({
        id:                 m.id,
        userId:             m.user?.id       ?? "",
        username:           m.user?.username ?? null,
        email:              m.user?.email    ?? null,
        status:             m.status         as MembershipStatus,
        createdAt:          createdMs,
        canceledAt:         canceledMs,
        cancelOption:       (m.cancel_option ?? null) as CancelOption | null,
        cancellationReason: m.cancellation_reason ?? null,
        planId:             m.plan?.id       ?? null,
        planTitle:          null,
        productId:          m.product?.id    ?? null,
        productTitle:       m.product?.title ?? null,
        totalSpendUsd:      0,
        promoCodeId:        m.promo_code?.id ?? null,
        renewalPeriodStart: renewStart,
        renewalPeriodEnd:   renewEnd,
        cancelAtPeriodEnd:  m.cancel_at_period_end ?? false,
      });
    }

    after = cursor ?? undefined;
    if (!after) break;
  }

  return records;
}