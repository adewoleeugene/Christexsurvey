"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Clock,
  Briefcase,
  Droplets,
  GraduationCap,
  HeartPulse,
  Shield,
  Brain,
  Users,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useReportsStore } from "@/store/reports-store";

const PROBLEM_CATEGORIES = [
  { id: "unemployment", label: "Unemployment", icon: Briefcase, color: "#ef4444" },
  { id: "poverty", label: "Poverty", icon: Users, color: "#f97316" },
  { id: "poor education", label: "Poor Education", icon: GraduationCap, color: "#3b82f6" },
  { id: "poor healthcare", label: "Poor Healthcare", icon: HeartPulse, color: "#22c55e" },
  { id: "mental health", label: "Mental Health", icon: Brain, color: "#8b5cf6" },
  { id: "insecurity", label: "Insecurity", icon: Shield, color: "#ec4899" },
  { id: "water", label: "Water / Sanitation", icon: Droplets, color: "#06b6d4" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  reportCounts: Record<string, number>;
  totalReports: number;
}

export function DashboardSidebar({
  collapsed,
  onToggle,
  reportCounts,
  totalReports,
}: SidebarProps) {
  const pathname = usePathname();
  const { selectedCategory, setSelectedCategory } = useReportsStore();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[52px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                Community Survey
              </span>
              <span className="text-[10px] text-muted-foreground">
                Dashboard
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-1">
          {!collapsed && (
            <span className="mb-1 block px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Navigation
            </span>
          )}
          <NavItem
            href="/"
            icon={LayoutDashboard}
            label="All Reports"
            badge={totalReports}
            active={selectedCategory === "all"}
            collapsed={collapsed}
            onClick={() => setSelectedCategory("all")}
          />
        </div>

        {/* Categories */}
        <div className="mt-4">
          {!collapsed && (
            <span className="mb-1 block px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Problem Categories
            </span>
          )}
          {PROBLEM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? "all" : cat.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                selectedCategory === cat.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div
                className="flex size-6 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <cat.icon className="size-3.5" style={{ color: cat.color }} />
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-left">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {reportCounts[cat.id] || 0}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
