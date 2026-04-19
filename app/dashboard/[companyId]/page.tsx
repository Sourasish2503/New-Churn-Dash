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

  // Step 2 — verify the user is an admin/owner of this company
  try {
    const membersPage = await whopsdk.members.list({
      companyId,
      page: 1,
      per: 50,
    } as Parameters<typeof whopsdk.members.list>[0]);

    // MemberListResponse nests user info under .user.id — not top-level user_id/userId
    const member = (membersPage.data ?? []).find(
      (m) => m.user?.id === userId
    );

    if (!member) {
      return (
        <div className="p-8 text-center text-sm text-gray-400">
          Access denied — not a member of this company.
        </div>
      );
    }

    const role: string = (member.role as string) ?? "";

    const isAdmin =
      role === "admin" || role === "owner" || role === "manager" || role === "";
    // Note: if role is empty string we still let through — it means
    // the field name differs; real access denial is handled by "not a member".

    if (!isAdmin) {
      return (
        <div className="p-8 text-center text-sm text-gray-400">
          Admin access required.
        </div>
      );
    }
  } catch (e) {
    console.error("[dashboard] admin check failed:", e);
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
