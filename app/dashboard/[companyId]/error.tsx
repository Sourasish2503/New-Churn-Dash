"use client";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-[#1a1a1a] border border-red-500/30 rounded-xl p-6 space-y-4">
        <h2 className="text-red-400 font-semibold text-lg">Dashboard Error</h2>
        <p className="text-gray-400 text-sm">Paste this into the chat so we can fix it:</p>
        <pre className="bg-[#0a0a0a] text-red-300 text-xs p-4 rounded-lg overflow-auto whitespace-pre-wrap break-all border border-red-500/20">
          {error?.message || "Unknown error"}
          {error?.stack ? "\n\n" + error.stack : ""}
          {error?.digest ? "\n\nDigest: " + error.digest : ""}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg border border-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
