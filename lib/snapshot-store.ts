import { getAdminDb } from "@/lib/firebase-admin";
import type { CachedSnapshot } from "@/types";

const COLLECTION = "cohort_snapshots";

export async function getSnapshot(companyId: string): Promise<CachedSnapshot | null> {
  try {
    const doc = await getAdminDb().collection(COLLECTION).doc(companyId).get();
    if (!doc.exists) return null;
    return doc.data() as CachedSnapshot;
  } catch (err) {
    console.error("[snapshot-store] getSnapshot error:", err);
    return null;
  }
}

export async function saveSnapshot(snapshot: CachedSnapshot): Promise<void> {
  try {
    await getAdminDb()
      .collection(COLLECTION)
      .doc(snapshot.companyId)
      .set(snapshot, { merge: false });
    console.log(`[snapshot-store] Saved for ${snapshot.companyId} (${snapshot.memberCount} members)`);
  } catch (err) {
    console.error("[snapshot-store] saveSnapshot error:", err);
    throw err;
  }
}

export async function invalidateSnapshot(companyId: string): Promise<void> {
  try {
    await getAdminDb().collection(COLLECTION).doc(companyId).delete();
  } catch (err) {
    console.error("[snapshot-store] invalidateSnapshot error:", err);
  }
}