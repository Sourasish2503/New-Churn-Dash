import { whopsdk } from "@/lib/whop-sdk";
import { invalidateSnapshot } from "@/lib/snapshot-store";

export async function POST(request: Request) {
  const body = await request.text();
  const hdrs = Object.fromEntries(request.headers);

  let event;
  try {
    event = whopsdk.webhooks.unwrap(body, { headers: hdrs });
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  const companyId = (event.data as { company_id?: string })?.company_id;

  const INVALIDATING_EVENTS = [
    "membership.activated", "membership.deactivated",
    "payment.succeeded",    "payment.failed",
  ];

  if (INVALIDATING_EVENTS.includes(event.type) && companyId) {
    await invalidateSnapshot(companyId);
  }

  return new Response("OK", { status: 200 });
}