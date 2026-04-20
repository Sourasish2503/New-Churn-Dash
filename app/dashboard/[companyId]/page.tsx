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

  // Step 1 — verify the Whop user token injected by the iframe proxy.
  // The dashboard view is only ever loaded by Whop for company admins,
  // so verifyUserToken alone is the correct and sufficient auth gate.
  try {
    await whopsdk.verifyUserToken(await headers());
  } catch (e) {
    console.error("[dashboard] verifyUserToken failed:", e);
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Session invalid — please reload the page.
      </div>
    );
  }

  // Step 2 — load or refresh the cohort snapshot
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
