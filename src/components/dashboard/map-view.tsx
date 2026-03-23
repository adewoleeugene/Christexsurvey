"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Report } from "@/lib/types";
import { useReportsStore } from "@/store/reports-store";
import { ReportsPanel } from "./reports-panel";
import { MapControls } from "./map-controls";

function createMarkerIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 32 : 24;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.4}" viewBox="0 0 24 34">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [size, size * 1.4],
    iconAnchor: [size / 2, size * 1.4],
    popupAnchor: [0, -(size * 1.4)],
  });
}

function getProblemColor(problems?: string): string {
  if (!problems) return "#6b7280";
  const p = problems.toLowerCase();
  if (p.includes("unemployment")) return "#ef4444";
  if (p.includes("poverty")) return "#f97316";
  if (p.includes("education")) return "#3b82f6";
  if (p.includes("healthcare")) return "#22c55e";
  if (p.includes("mental")) return "#8b5cf6";
  if (p.includes("insecurity")) return "#ec4899";
  if (p.includes("water")) return "#06b6d4";
  return "#6b7280";
}

/** Flies to selected report on the map */
function FlyToSelected({ reports }: { reports: Report[] }) {
  const map = useMap();
  const selectedReportId = useReportsStore((s) => s.selectedReportId);

  useEffect(() => {
    if (!selectedReportId) return;
    const report = reports.find((r) => r.id === selectedReportId);
    if (report?.latitude && report?.longitude) {
      map.flyTo([report.latitude, report.longitude], 14, { duration: 1 });
    }
  }, [selectedReportId, reports, map]);

  return null;
}

/** Exposes map methods to parent via ref stored in module scope */
let mapInstance: L.Map | null = null;

function MapRefCapture() {
  const map = useMap();
  useEffect(() => {
    mapInstance = map;
  }, [map]);
  return null;
}

/** Group reports that are very close together (within ~50m) */
function clusterReports(reports: Report[]) {
  const threshold = 0.0005; // ~50 meters
  const clusters: { lat: number; lng: number; reports: Report[] }[] = [];

  for (const report of reports) {
    if (!report.latitude || !report.longitude) continue;
    const existing = clusters.find(
      (c) =>
        Math.abs(c.lat - report.latitude!) < threshold &&
        Math.abs(c.lng - report.longitude!) < threshold
    );
    if (existing) {
      existing.reports.push(report);
    } else {
      clusters.push({
        lat: report.latitude,
        lng: report.longitude,
        reports: [report],
      });
    }
  }
  return clusters;
}

function createClusterIcon(count: number, color: string) {
  const size = count > 9 ? 44 : 38;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2.5" opacity="0.9"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="none" stroke="${color}" stroke-width="1" opacity="0.3" r="${size / 2 + 4}"/>
    <text x="${size / 2}" y="${size / 2 + 1}" text-anchor="middle" dominant-baseline="central" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${count}</text>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

function MapMarkers({ reports }: { reports: Report[] }) {
  const selectedReportId = useReportsStore((s) => s.selectedReportId);
  const showListForCommunity = useReportsStore((s) => s.showListForCommunity);
  const showAllReports = useReportsStore((s) => s.showAllReports);
  const clusters = clusterReports(reports);

  return (
    <>
      {clusters.map((cluster, idx) => {
        const isCluster = cluster.reports.length > 1;

        if (isCluster) {
          // Cluster marker
          const community =
            cluster.reports[0].answers?.community || "Unknown";
          const color = getProblemColor(
            cluster.reports[0].answers?.biggest_problems
          );

          return (
            <Marker
              key={`cluster-${idx}`}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster.reports.length, color)}
              eventHandlers={{
                click: () => {
                  showAllReports();
                },
              }}
            />
          );
        }

        // Single marker
        const report = cluster.reports[0];
        const isSelected = selectedReportId === report.id;
        const color = getProblemColor(report.answers?.biggest_problems);
        const answers = report.answers || {};

        return (
          <Marker
            key={report.id}
            position={[cluster.lat, cluster.lng]}
            icon={createMarkerIcon(color, isSelected)}
            eventHandlers={{
              click: () => {
                showListForCommunity(answers.community || "");
              },
            }}
          />
        );
      })}
    </>
  );
}

export default function DashboardMapView({
  reports,
}: {
  reports: Report[];
}) {
  const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  const handleLocateMe = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        mapInstance?.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => {
        mapInstance?.flyTo([8.46, -11.78], 8);
      }
    );
  }, []);

  const handleResetView = useCallback(() => {
    mapInstance?.flyTo([8.46, -11.78], 8, { duration: 1 });
  }, []);

  const handleZoomIn = useCallback(() => {
    mapInstance?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapInstance?.zoomOut();
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Map */}
      <MapContainer
        center={[8.46, -11.78]}
        zoom={8}
        zoomControl={false}
        style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
      >
        <TileLayer key={tileUrl} attribution={attribution} url={tileUrl} />
        <MapRefCapture />
        <FlyToSelected reports={reports} />
        <MapMarkers reports={reports} />
      </MapContainer>

      {/* Panel & Controls rendered OUTSIDE the map container */}
      <ReportsPanel />
      <MapControls
        onLocateMe={handleLocateMe}
        onResetView={handleResetView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}
