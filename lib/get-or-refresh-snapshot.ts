import { fetchAllMembers, STALE_MS } from "@/lib/whop-fetcher";
import { getSnapshot, saveSnapshot } from "@/lib/snapshot-store";
import { computeKPIs, buildCohortMatrix, buildChurnVelocity, buildCancelReasons, buildAtRisk } from "@/lib/cohort-engine";
import type { CachedSnapshot } from "@/types";

export async function getOrRefreshSnapshot(
  companyId: string,
  forceRefresh = false
): Promise<CachedSnapshot> {
  if (!forceRefresh) {
    const cached = await getSnapshot(companyId);
    if (cached && Date.now() - cached.fetchedAt < STALE_MS) {
      console.log(`[snapshot] Cache hit for ${companyId}`);
      return cached;
    }
  }

  console.log(`[snapshot] Fetching fresh data for ${companyId}`);
  const members = await fetchAllMembers(companyId);

  const snapshot: CachedSnapshot = {
    companyId,
    fetchedAt:    Date.now(),
    kpis:         computeKPIs(members),
    cohortRows:   buildCohortMatrix(members),
    churnVelocity: buildChurnVelocity(members),
    cancelReasons: buildCancelReasons(members),
    atRisk:       buildAtRisk(members),
    memberCount:  members.length,
  };

  await saveSnapshot(snapshot);
  return snapshot;
}