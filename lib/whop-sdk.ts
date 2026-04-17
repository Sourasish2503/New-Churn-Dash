import { WhopServerSdk } from "@whop/sdk";

if (!process.env.WHOP_API_KEY) throw new Error("Missing env: WHOP_API_KEY");
if (!process.env.NEXT_PUBLIC_WHOP_APP_ID) throw new Error("Missing env: NEXT_PUBLIC_WHOP_APP_ID");

export const whopsdk = WhopServerSdk({
  token: process.env.WHOP_API_KEY,
  onBehalfOf: undefined,
});
