import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 snap-y snap-mandatory overflow-y-auto motion-reduce:snap-none">{children}</main>
    </div>
  );
}
