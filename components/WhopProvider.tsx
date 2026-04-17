"use client";
import { WhopIframeSdkProvider } from "@whop/react";

export default function WhopProvider({ children }: { children: React.ReactNode }) {
  return <WhopIframeSdkProvider>{children}</WhopIframeSdkProvider>;
}