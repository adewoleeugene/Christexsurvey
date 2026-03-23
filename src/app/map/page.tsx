"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Report } from "@/lib/types";

const MapView = dynamic(() => import("./map-view"), { ssr: false });

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 py-8 text-center">Loading map...</p>;
  }

  const reportsWithLocation = reports.filter(
    (r) => r.latitude && r.longitude
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Map View</h2>
        <span className="text-sm text-gray-500">
          {reportsWithLocation.length} report
          {reportsWithLocation.length !== 1 ? "s" : ""} with location
        </span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <MapView reports={reportsWithLocation} />
      </div>
    </div>
  );
}
