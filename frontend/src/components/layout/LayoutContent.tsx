"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/navigation/BottomNav";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      <div className={isAdminRoute ? "" : "pb-16 md:pb-0"}>
        {children}
      </div>
      {!isAdminRoute && <BottomNav />}
    </>
  );
}
