"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useReportsStore } from "@/store/reports-store";
import type { Report } from "@/lib/types";

const DashboardMapView = dynamic(
  () => import("@/components/dashboard/map-view"),
  { ssr: false }
);

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { reports, setReports, getFilteredReports } = useReportsStore();

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data: Report[]) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setReports]);

  const reportCounts: Record<string, number> = {};
  for (const r of reports) {
    const problems = (r.answers?.biggest_problems || "").toLowerCase();
    for (const cat of [
      "unemployment",
      "poverty",
      "poor education",
      "poor healthcare",
      "mental health",
      "insecurity",
      "water",
    ]) {
      if (problems.includes(cat)) {
        reportCounts[cat] = (reportCounts[cat] || 0) + 1;
      }
    }
  }

  const reportsWithLocation = getFilteredReports().filter(
    (r) => r.latitude && r.longitude
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        reportCounts={reportCounts}
        totalReports={reports.length}
      />
      <main className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <p className="text-sm">Loading reports...</p>
            </div>
          </div>
        ) : (
          <DashboardMapView reports={reportsWithLocation} />
        )}
      </main>
    </div>
  );
}
