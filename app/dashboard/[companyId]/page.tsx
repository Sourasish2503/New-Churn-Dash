import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { getOrRefreshSnapshot } from "@/lib/get-or-refresh-snapshot";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ refresh?: string }>;
}

async function checkAdminAccess(companyId: string, userId: string): Promise<boolean> {
  const res = await fetch(
    `https://api.whop.com/api/v2/companies/${companyId}/memberships?user_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return false;
  const data = await res.json();
  // Company owner / admin always has a valid membership with manage rights
  return Array.isArray(data?.data) && data.data.length > 0;
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { companyId } = await params;
  const { refresh }   = await searchParams;

  // Step 1 — verify the Whop user token injected by the iframe proxy
  let userId: string;
  try {
    const result = await whopsdk.verifyUserToken(await headers());
    userId = result.userId;
  } catch {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Session invalid — please reload the page.
      </div>
    );
  }

  // Step 2 — check admin access via REST
  const isAdmin = await checkAdminAccess(companyId, userId);
  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Admin access required.
      </div>
    );
  }

  // Step 3 — load or refresh the cohort snapshot
  let snapshot;
  try {
    snapshot = await getOrRefreshSnapshot(companyId, refresh === "1");
  } catch (e) {
    console.error("[dashboard] snapshot error:", e);
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Data load failed.{" "}
        <a href="?refresh=1" className="underline">Try refreshing</a>.
      </div>
    );
  }

  return (
    <DashboardShell
      companyId={companyId}
      snapshot={snapshot}
      fetchedAt={snapshot.fetchedAt}
    />
  );
}
