import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { getOrRefreshSnapshot } from "@/lib/get-or-refresh-snapshot";
import DashboardShell from "@/components/DashboardShell";

interface Props {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ refresh?: string }>;
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { companyId } = await params;
  const { refresh }   = await searchParams;

  let userId: string;
  try {
    ({ userId } = await whopsdk.verifyUserToken(await headers()));
  } catch {
    return <div className="p-8 text-center text-sm text-gray-400">Session invalid. Reload the page.</div>;
  }

  let access;
  try {
    access = await whopsdk.users.checkAccess(companyId, { id: userId });
  } catch {
    return <div className="p-8 text-center text-sm text-gray-400">Could not verify access.</div>;
  }

  if (access.access_level !== "admin") {
    return <div className="p-8 text-center text-sm text-gray-400">Admin access required.</div>;
  }

  let snapshot;
  try {
    snapshot = await getOrRefreshSnapshot(companyId, refresh === "1");
  } catch {
    return <div className="p-8 text-center text-sm text-gray-400">Data load failed. Refresh the page.</div>;
  }

  return <DashboardShell companyId={companyId} snapshot={snapshot} fetchedAt={snapshot.fetchedAt} />;
}