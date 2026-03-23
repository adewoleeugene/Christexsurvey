"use client";

import { useState } from "react";
import type { Report } from "@/lib/types";

export function ReportsTable({ reports }: { reports: Report[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = reports.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const answers = r.answers || {};
    return (
      (answers.community || "").toLowerCase().includes(s) ||
      (answers.occupation || "").toLowerCase().includes(s) ||
      (answers.priority_problem || "").toLowerCase().includes(s) ||
      r.phone.includes(s)
    );
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search by community, occupation, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">No reports found.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Community
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Age
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Gender
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Priority Problem
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <TableRow
                  key={report.id}
                  report={report}
                  isExpanded={expandedId === report.id}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === report.id ? null : report.id
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TableRow({
  report,
  isExpanded,
  onToggle,
}: {
  report: Report;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const answers = report.answers || {};
  const date = new Date(report.submitted_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3">{answers.community || "-"}</td>
        <td className="px-4 py-3">{answers.age || "-"}</td>
        <td className="px-4 py-3">{answers.gender || "-"}</td>
        <td className="px-4 py-3">{answers.priority_problem || "-"}</td>
        <td className="px-4 py-3 text-gray-500">{date}</td>
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? "Hide" : "View"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-blue-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Detail label="Phone" value={report.phone} />
              <Detail label="Age" value={answers.age} />
              <Detail label="Gender" value={answers.gender} />
              <Detail label="Community" value={answers.community} />
              <Detail label="Occupation" value={answers.occupation} />
              <Detail
                label="Biggest Problems"
                value={answers.biggest_problems}
              />
              <Detail
                label="Most Personal Problem"
                value={answers.most_personal_problem}
              />
              <Detail
                label="Current Solutions"
                value={answers.current_solutions}
              />
              <Detail label="What's Missing" value={answers.whats_missing} />
              <Detail label="Support Needed" value={answers.support_needed} />
              <Detail
                label="Who Needs Most"
                value={answers.who_needs_most}
              />
              <Detail
                label="Priority Problem"
                value={answers.priority_problem}
              />
              <Detail label="Why Urgent" value={answers.why_urgent} />
              <Detail
                label="Preferred Channel"
                value={answers.preferred_channel}
              />
              <Detail label="Barriers" value={answers.barriers} />
              <Detail
                label="Final Comments"
                value={answers.final_comments}
              />
              <Detail label="Location" value={answers.location} />
              {report.latitude && report.longitude && (
                <Detail
                  label="Coordinates"
                  value={`${report.latitude}, ${report.longitude}`}
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="font-medium text-gray-700">{label}:</span>{" "}
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
