"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Report } from "@/lib/types";

// Fix default marker icon issue with webpack
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({ reports }: { reports: Report[] }) {
  // Center on Sierra Leone
  const center: [number, number] = [8.46, -11.78];

  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude!, report.longitude!]}
          icon={icon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">
                {report.answers?.community || "Unknown"}
              </p>
              <p>Priority: {report.answers?.priority_problem || "-"}</p>
              <p>
                Date:{" "}
                {new Date(report.submitted_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
