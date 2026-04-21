"use client";
import { useEffect } from "react";

function isWhopInternalError(error: Error): boolean {
  const stack = error?.stack ?? "";
  const message = error?.message ?? "";
  return (
    stack.includes("apps.whop.com") ||
    stack.includes("MessagePort") ||
    stack.includes("907af91b") ||
    stack.includes("205-00133864") ||
    message === "r is not a function" ||
    message === "a is not a function"
  );
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isWhopInternalError(error)) {
      console.warn("[GlobalError] Whop internal error suppressed:", error.message);
      return;
    }
    console.error("[GlobalError]", error);
  }, [error]);

  // Whop's own crash — render nothing, let the page show through
  if (isWhopInternalError(error)) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-[#1a1a1a] border border-red-500/30 rounded-xl p-6 space-y-4">
        <h2 className="text-red-400 font-semibold text-lg">Application Error</h2>
        <p className="text-gray-400 text-sm">An error occurred. Details below:</p>
        <pre className="bg-[#0a0a0a] text-red-300 text-xs p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all border border-red-500/20">
          {error?.message || "Unknown error"}
          {error?.stack ? "\n\n" + error.stack : ""}
          {error?.digest ? "\n\nDigest: " + error.digest : ""}
        </pre>
      </div>
    </div>
  );
}
