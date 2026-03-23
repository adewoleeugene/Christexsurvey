"use client";

import { useState } from "react";
import {
  Search,
  X,
  ArrowUpDown,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  Briefcase,
  MessageSquare,
  Target,
  Shield,
  Phone,
  Layers,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useReportsStore } from "@/store/reports-store";
import type { Report } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "community-az", label: "Community A-Z" },
  { value: "community-za", label: "Community Z-A" },
] as const;

function groupByLocation(reports: Report[]) {
  const groups: Record<string, Report[]> = {};
  for (const r of reports) {
    const key = r.answers?.community || "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

export function ReportsPanel() {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedReportId,
    selectReport,
    viewingReportId,
    viewReport,
    getFilteredReports,
    isPanelVisible,
    setPanelVisible,
    isPanelCollapsed,
    setPanelCollapsed,
  } = useReportsStore();

  const [showSort, setShowSort] = useState(false);
  const reports = getFilteredReports();

  if (!isPanelVisible) return null;

  if (isPanelCollapsed) {
    return (
      <button
        onClick={() => setPanelCollapsed(false)}
        className="absolute left-4 top-4 z-[1000] flex h-11 items-center gap-2 rounded-lg border bg-background px-3 shadow-lg transition-colors hover:bg-accent"
      >
        <Layers className="size-4" />
        <span className="text-sm font-medium">
          {reports.length} Reports
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
    );
  }

  // Full report detail is shown as an overlay on top of the list
  const viewingReport = viewingReportId
    ? reports.find((r) => r.id === viewingReportId) || null
    : null;

  return (
    <div className="absolute left-4 top-4 bottom-4 z-[1000] flex w-80 flex-col overflow-hidden rounded-xl border bg-background shadow-lg sm:w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Survey Reports</h2>
          <p className="text-xs text-muted-foreground">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPanelCollapsed(true)}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
          >
            <ChevronUp className="size-4" />
          </button>
        </div>
      </div>

      {/* Search & Sort — always visible */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border bg-transparent pl-8 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex h-9 items-center gap-1 rounded-md border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
          >
            <ArrowUpDown className="size-3" />
            <ChevronDown className="size-3" />
          </button>
          {showSort && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowSort(false)}
              />
              <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border bg-popover p-1 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                      sortBy === opt.value
                        ? "bg-accent font-medium"
                        : "hover:bg-accent"
                    )}
                  >
                    {sortBy === opt.value && <Check className="size-3" />}
                    <span className={sortBy !== opt.value ? "pl-5" : ""}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content area — list is always the base, detail overlays on top */}
      <div className="relative flex-1 overflow-hidden">
        {/* Reports List — always rendered */}
        <div className="absolute inset-0 overflow-y-auto p-2">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="size-10 mb-2 opacity-50" />
              <p className="text-sm font-medium">No reports found</p>
              <p className="text-xs">Try adjusting your search or filters</p>
            </div>
          ) : (
            <ReportsList
              reports={reports}
              selectedReportId={selectedReportId}
              onSelect={(id) => selectReport(selectedReportId === id ? null : id)}
              onViewDetail={(id) => {
                selectReport(id);
                viewReport(id);
              }}
            />
          )}
        </div>

        {/* Full Report Overlay — slides over the list */}
        {viewingReport && (
          <div className="absolute inset-0 z-10 flex flex-col bg-background">
            <button
              onClick={() => viewReport(null)}
              className="flex items-center gap-2 border-b px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to list
            </button>
            <div className="flex-1 overflow-y-auto">
              <FullReportView report={viewingReport} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsList({
  reports,
  selectedReportId,
  onSelect,
  onViewDetail,
}: {
  reports: Report[];
  selectedReportId: string | null;
  onSelect: (id: string) => void;
  onViewDetail: (id: string) => void;
}) {
  const groups = groupByLocation(reports);
  const entries = Object.entries(groups).sort(
    (a, b) => b[1].length - a[1].length
  );

  const hasGroups = entries.some(([, list]) => list.length > 1);
  if (!hasGroups) {
    return (
      <div className="flex flex-col gap-2">
        {reports.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            isSelected={selectedReportId === r.id}
            onSelect={() => onSelect(r.id)}
            onViewDetail={() => onViewDetail(r.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([community, groupReports]) => (
        <LocationGroup
          key={community}
          community={community}
          reports={groupReports}
          selectedReportId={selectedReportId}
          onSelect={onSelect}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}

function LocationGroup({
  community,
  reports,
  selectedReportId,
  onSelect,
  onViewDetail,
}: {
  community: string;
  reports: Report[];
  selectedReportId: string | null;
  onSelect: (id: string) => void;
  onViewDetail: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <MapPin className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{community}</p>
          <p className="text-[11px] text-muted-foreground">
            {reports.length} response{reports.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {reports.length}
          </span>
          {expanded ? (
            <ChevronUp className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t px-2 py-2 flex flex-col gap-1.5">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              compact
              isSelected={selectedReportId === r.id}
              onSelect={() => onSelect(r.id)}
              onViewDetail={() => onViewDetail(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({
  report,
  compact,
  isSelected,
  onSelect,
  onViewDetail,
}: {
  report: Report;
  compact?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetail: () => void;
}) {
  const answers = report.answers || {};
  const date = new Date(report.submitted_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const problemColor = getProblemColor(answers.biggest_problems);

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        compact ? "p-2" : "p-3",
        isSelected ? "border-primary bg-accent/30" : "hover:bg-accent/50"
      )}
    >
      {/* Clickable header area — highlights the card */}
      <div className="cursor-pointer" onClick={onSelect}>
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md",
              compact ? "size-7" : "size-8"
            )}
            style={{ backgroundColor: `${problemColor}15` }}
          >
            <AlertTriangle
              className={compact ? "size-3" : "size-3.5"}
              style={{ color: problemColor }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={cn(
                  "font-medium leading-tight truncate",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                {compact
                  ? `${answers.gender || ""} · Age ${answers.age || "?"}`
                  : answers.community || "Unknown"}
              </h3>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {date}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {answers.priority_problem || "No priority set"}
            </p>
          </div>
        </div>

        {!compact && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {(answers.biggest_problems || "")
              .split(", ")
              .filter(Boolean)
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* View button — separate from the highlight click */}
      {isSelected && (
        <button
          onClick={onViewDetail}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Eye className="size-3" />
          View Full Report
        </button>
      )}
    </div>
  );
}

function FullReportView({ report }: { report: Report }) {
  const answers = report.answers || {};
  const date = new Date(report.submitted_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const problemColor = getProblemColor(answers.biggest_problems);

  return (
    <>
      <div className="border-b px-4 py-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${problemColor}20` }}
          >
            <AlertTriangle
              className="size-6"
              style={{ color: problemColor }}
            />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {answers.community || "Unknown Community"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {answers.occupation || "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatCard label="Age" value={answers.age || "—"} icon={User} />
          <StatCard label="Gender" value={answers.gender || "—"} icon={User} />
          <StatCard
            label="Date"
            value={new Date(report.submitted_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
            icon={Calendar}
          />
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {answers.priority_problem && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="size-3.5 text-destructive" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                Priority Problem
              </span>
            </div>
            <p className="text-sm font-medium">{answers.priority_problem}</p>
            {answers.why_urgent && (
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {answers.why_urgent}
              </p>
            )}
          </div>
        )}

        <Section title="Community Challenges" icon={AlertTriangle}>
          <div className="flex flex-wrap gap-1.5">
            {(answers.biggest_problems || "—")
              .split(", ")
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
          </div>
          {answers.most_personal_problem && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Most personal:</span>{" "}
              {answers.most_personal_problem}
            </p>
          )}
        </Section>

        <Section title="Current Solutions" icon={Shield}>
          <p className="text-xs leading-relaxed">
            {answers.current_solutions || "—"}
          </p>
          {answers.whats_missing && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">What&apos;s missing:</span>{" "}
              {answers.whats_missing}
            </p>
          )}
        </Section>

        <Section title="Support Needed" icon={Briefcase}>
          <div className="flex flex-wrap gap-1.5">
            {(answers.support_needed || "—")
              .split(", ")
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
          </div>
          {answers.who_needs_most && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Who needs most:</span>{" "}
              {answers.who_needs_most}
            </p>
          )}
        </Section>

        <Section title="Access & Engagement" icon={MessageSquare}>
          {answers.preferred_channel && (
            <p className="text-xs">
              <span className="font-medium">Preferred channels:</span>{" "}
              {answers.preferred_channel}
            </p>
          )}
          {answers.barriers && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Barriers:</span>{" "}
              {answers.barriers}
            </p>
          )}
        </Section>

        {answers.final_comments && (
          <Section title="Additional Comments" icon={MessageSquare}>
            <p className="text-xs leading-relaxed italic text-muted-foreground">
              &ldquo;{answers.final_comments}&rdquo;
            </p>
          </Section>
        )}

        <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Phone className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-mono text-[11px]">{report.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Submitted:</span>
            <span>{date}</span>
          </div>
          {report.latitude && report.longitude && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">Coords:</span>
              <span className="font-mono text-[11px]">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
      <Icon className="mx-auto size-3.5 text-muted-foreground mb-1" />
      <p className="text-xs font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
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
