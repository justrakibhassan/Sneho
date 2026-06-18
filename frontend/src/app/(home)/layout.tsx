"use client";

import Footer from "@/modules/home/components/footer";
import Navbar from "@/modules/home/components/navbar";
import { usePathname } from "next/navigation";
import { FavoritesProvider } from "@/context/favorites-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMeetingPage = pathname.startsWith("/meeting");

  if (isMeetingPage) {
    return <>{children}</>;
  }

  return (
    <FavoritesProvider>
      <div>
        <Navbar />
        {children}
        <Footer />
      </div>
    </FavoritesProvider>
  );
}
