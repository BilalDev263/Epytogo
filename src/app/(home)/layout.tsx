"use client";

import { Header } from "@/components/Header";
import AdBanner from "@/components/ads/AdBanner";
import { useSubscription } from "@/hooks/useSubscription";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { hasAdsAccess, loading } = useSubscription();

  return (
    <div>
      <Header />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar Left */}
        {hasAdsAccess && !loading && (
          <aside className="hidden xl:block w-80 pl-6 pr-0 py-6 flex items-center justify-center sticky top-32 h-fit mt-20">
            <AdBanner position="SIDEBAR_LEFT" limit={1} />
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-w-0 ${hasAdsAccess && !loading ? 'max-w-6xl' : 'max-w-7xl'} mx-auto`}>
          {children}
        </main>

        {/* Sidebar Right */}
        {hasAdsAccess && !loading && (
          <aside className="hidden xl:block w-80 px-6 py-6 flex items-center justify-center sticky top-32 h-fit mt-20">
            <AdBanner position="SIDEBAR_RIGHT" limit={1} />
          </aside>
        )}
      </div>
    </div>
  );
}
