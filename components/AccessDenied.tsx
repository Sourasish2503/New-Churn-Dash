import { ShieldX, Lock, ServerCrash } from "lucide-react";

type Reason = "auth" | "not_admin" | "check_failed" | "data_error";

const MESSAGES: Record<Reason, { icon: React.ReactNode; title: string; body: string }> = {
  auth:         { icon: <Lock className="w-8 h-8" />,        title: "Authentication Required",  body: "Your session could not be verified. Please reload." },
  not_admin:    { icon: <ShieldX className="w-8 h-8" />,     title: "Admin Access Required",    body: "This dashboard is only for company administrators." },
  check_failed: { icon: <ShieldX className="w-8 h-8" />,     title: "Access Check Failed",      body: "Could not verify your permissions. Please try again." },
  data_error:   { icon: <ServerCrash className="w-8 h-8" />, title: "Data Unavailable",         body: "Could not load dashboard data. Please refresh." },
};

export default function AccessDenied({ reason }: { reason: Reason }) {
  const { icon, title, body } = MESSAGES[reason];
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
        <div className="text-[#888]">{icon}</div>
        <h1 className="text-[#f5f5f5] text-lg font-semibold">{title}</h1>
        <p className="text-[#888] text-sm leading-relaxed">{body}</p>
        <button onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f5f5f5]
                     text-sm rounded-lg border border-[#2a2a2a] transition-colors">
          Reload
        </button>
      </div>
    </div>
  );
}