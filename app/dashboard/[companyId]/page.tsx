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

  // Step 2 — verify the user is an ADMIN of this company
  // Docs: parameter is company_id (snake_case), pagination uses `first` not `per`
  // Member shape: { user: { id }, access_level: "admin" | "customer" | "no_access" }
  try {
    const membersPage = await whopsdk.members.list({
      company_id: companyId,
      first: 50,
    } as Parameters<typeof whopsdk.members.list>[0]);

    const currentMember = (membersPage.data ?? []).find(
      (m) => m.user?.id === userId
    );

    // Dashboard view is admin-only
    if (!currentMember || currentMember.access_level !== "admin") {
      return (
        <div className="p-8 text-center text-sm text-gray-400">
          Access denied — admin access required.
        </div>
      );
    }
  } catch (e) {
    console.error("[dashboard] member check failed:", e);
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Could not verify access — please reload.
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
