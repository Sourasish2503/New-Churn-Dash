import { headers } from "next/headers";
import { validateToken } from "@whop/sdk";
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

  // Step 1 — verify the user token Whop injects into the iframe request
  let userId: string;
  try {
    const result = await validateToken({ headers: await headers() });
    userId = result.userId;
  } catch {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Session invalid — please reload the page.
      </div>
    );
  }

  // Step 2 — verify the user is an admin of this company
  let access;
  try {
    access = await whopsdk.access.check({
      accessPassId: companyId,
      userId,
    });
  } catch {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Could not verify access. Please reload.
      </div>
    );
  }

  if (!access.valid) {
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
        Data load failed. <a href="?refresh=1" className="underline">Try refreshing</a>.
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
