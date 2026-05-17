import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { StorageBanner } from "@/components/layout/storage-banner";
import { StoreNotifications } from "@/components/layout/store-notifications";
import { SplashScreen } from "@/components/layout/splash-screen";
import { TopBar } from "@/components/layout/top-bar";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hydra",
  description: "Daily hydration tracker — build the habit, one glass at a time",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("hydra-theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;if(s==="dark"||(!s&&d)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <SplashScreen />
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
          <TopBar />
          <StorageBanner />
          <StoreNotifications />
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
