import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { getOrRefreshSnapshot } from "@/lib/get-or-refresh-snapshot";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ refresh?: string }>;
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { companyId } = await params;
  const { refresh }   = await searchParams;

  console.log("[dashboard] START companyId:", companyId);

  // Step 1 — verify the Whop user token
  let userId: string;
  try {
    const allHeaders = await headers();
    const token = allHeaders.get("x-whop-user-token");
    console.log("[dashboard] x-whop-user-token present:", !!token);
    console.log("[dashboard] x-whop-user-token value:", token ?? "MISSING");

    const result = await whopsdk.verifyUserToken(allHeaders);
    userId = result.userId;
    console.log("[dashboard] verified userId:", userId);
  } catch (e) {
    console.error("[dashboard] verifyUserToken failed:", e);
    // Re-throw so error.tsx can display the real message
    throw e;
  }

  // Step 2 — verify admin access
  try {
    console.log("[dashboard] calling members.list with company_id:", companyId);
    const membersPage = await whopsdk.members.list({
      company_id: companyId,
      first: 50,
    } as Parameters<typeof whopsdk.members.list>[0]);

    console.log("[dashboard] members.list returned count:", membersPage.data?.length ?? 0);
    console.log("[dashboard] members sample:", JSON.stringify(membersPage.data?.slice(0, 2)));

    const currentMember = (membersPage.data ?? []).find(
      (m) => m.user?.id === userId
    );

    console.log("[dashboard] currentMember:", JSON.stringify(currentMember ?? null));
    console.log("[dashboard] access_level:", currentMember?.access_level ?? "NOT FOUND");

    if (!currentMember || currentMember.access_level !== "admin") {
      throw new Error(
        `Access denied. userId=${userId} access_level=${
          currentMember?.access_level ?? "member not found in first 50"
        }`
      );
    }
  } catch (e) {
    console.error("[dashboard] member check failed:", e);
    throw e;
  }

  // Step 3 — load snapshot
  try {
    console.log("[dashboard] loading snapshot...");
    const snapshot = await getOrRefreshSnapshot(companyId, refresh === "1");
    console.log("[dashboard] snapshot loaded, memberCount:", snapshot.memberCount);
    return (
      <DashboardShell
        companyId={companyId}
        snapshot={snapshot}
        fetchedAt={snapshot.fetchedAt}
      />
    );
  } catch (e) {
    console.error("[dashboard] snapshot failed:", e);
    throw e;
  }
}
