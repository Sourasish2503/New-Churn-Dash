import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const h = await headers();

  // Whop injects the company context via this header when the app loads in the iframe
  const companyId =
    h.get("x-whop-company-id") ||
    h.get("x-whop-biz-id") ||
    h.get("x-company-id");

  console.log("[root] x-whop-company-id:", companyId);
  console.log("[root] all headers:", Object.fromEntries(h.entries()));

  if (companyId) {
    redirect(`/dashboard/${companyId}`);
  }

  // Fallback — show all headers so we can find the right one
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-8 font-mono text-xs">
      <h1 className="text-base font-semibold mb-4 text-violet-400">Cohort Dashboard</h1>
      <p className="text-[#888] mb-6">
        No company ID found in headers. Open this app from inside your Whop dashboard.
      </p>
      <p className="text-[#666] mb-2">Headers received:</p>
      <pre className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4 overflow-auto whitespace-pre-wrap break-all text-[#aaa]">
        {JSON.stringify(Object.fromEntries(h.entries()), null, 2)}
      </pre>
    </div>
  );
}
