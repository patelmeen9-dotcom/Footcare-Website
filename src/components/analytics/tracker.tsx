"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function AnalyticsTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Collect paths and search queries for tracking
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    
    // Simulate analytic tag event sending
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics Event] Page View Tracked: ${url}`);
    } else {
      // Production: trigger window.gtag or custom tracking triggers
      const windowWithGtag = window as unknown as {
        gtag?: (command: string, id: string, params: Record<string, unknown>) => void;
      };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag("config", process.env.NEXT_PUBLIC_GA_ID || "UA-MOCK-ID", {
          page_path: url,
        });
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerContent />
    </Suspense>
  );
}
