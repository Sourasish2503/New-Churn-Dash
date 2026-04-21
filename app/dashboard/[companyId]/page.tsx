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

  // Step 1 — verify token
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

  // Step 2 — load snapshot
  let snapshot;
  try {
    snapshot = await getOrRefreshSnapshot(companyId, refresh === "1");
  } catch (e: unknown) {
    const err = e as Error;
    console.error("[dashboard] snapshot error:", err);

    // Show the ACTUAL error message so we can diagnose it
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 font-mono">
        <div className="max-w-2xl mx-auto bg-[#1a1a1a] border border-red-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-red-400 font-semibold">Data load failed</h2>
          <p className="text-[#888] text-sm">companyId: <span className="text-[#f5f5f5]">{companyId}</span></p>
          <pre className="bg-[#0a0a0a] text-red-300 text-xs p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all border border-red-500/20">
            {err?.message || "Unknown error"}
            {err?.stack ? "\n\n" + err.stack : ""}
          </pre>
          <a
            href={`/dashboard/${companyId}?refresh=1`}
            className="inline-block px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg border border-red-500/30"
          >
            Try refreshing
          </a>
        </div>
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
