import WhopProvider from "@/components/WhopProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WhopProvider>{children}</WhopProvider>;
}