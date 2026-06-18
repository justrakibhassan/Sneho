import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import SessionSync from "@/components/auth/SessionSync";
import SupportWidget from "@/components/support/SupportWidget";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import LayoutContent from "@/components/layout/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sneho",
    default: "Sneho - Babysitting Platform",
  },
  description: "Sneho - A comprehensive platform connecting parents with trusted babysitters, featuring smart matching, real-time tracking, and secure bookings.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/sneho_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Toaster position="top-center" />
          <SessionSync />
          <NuqsAdapter>
            <LayoutContent>{children}</LayoutContent>
            <SupportWidget />
          </NuqsAdapter>
        </AuthProvider>
      </body>
    </html>
  );
}
