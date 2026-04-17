import Whop from "@whop/sdk";

if (!process.env.WHOP_API_KEY) throw new Error("Missing env: WHOP_API_KEY");
if (!process.env.NEXT_PUBLIC_WHOP_APP_ID) throw new Error("Missing env: NEXT_PUBLIC_WHOP_APP_ID");

export const whopsdk = new Whop({
  apiKey: process.env.WHOP_API_KEY,
  appID:  process.env.NEXT_PUBLIC_WHOP_APP_ID,
});
