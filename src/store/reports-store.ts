import { create } from "zustand";
import type { Report } from "@/lib/types";

type SortBy =
  | "newest"
  | "oldest"
  | "community-az"
  | "community-za";

interface ReportsState {
  reports: Report[];
  selectedReportId: string | null;
  viewingReportId: string | null;
  searchQuery: string;
  sortBy: SortBy;
  selectedCategory: string;
  isPanelVisible: boolean;
  isPanelCollapsed: boolean;

  setReports: (reports: Report[]) => void;
  selectReport: (id: string | null) => void;
  viewReport: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortBy) => void;
  setSelectedCategory: (category: string) => void;
  setPanelVisible: (visible: boolean) => void;
  setPanelCollapsed: (collapsed: boolean) => void;
  showListForCommunity: (community: string) => void;
  showAllReports: () => void;
  getFilteredReports: () => Report[];
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  selectedReportId: null,
  viewingReportId: null,
  searchQuery: "",
  sortBy: "newest",
  selectedCategory: "all",
  isPanelVisible: true,
  isPanelCollapsed: true,

  setReports: (reports) => set({ reports }),
  selectReport: (id) => set({ selectedReportId: id }),
  viewReport: (id) => set({ viewingReportId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setPanelVisible: (visible) => set({ isPanelVisible: visible }),
  setPanelCollapsed: (collapsed) => set({ isPanelCollapsed: collapsed }),
  showListForCommunity: (community) =>
    set({
      viewingReportId: null,
      selectedReportId: null,
      searchQuery: community,
      isPanelVisible: true,
      isPanelCollapsed: false,
    }),
  showAllReports: () =>
    set({
      viewingReportId: null,
      selectedReportId: null,
      searchQuery: "",
      isPanelVisible: true,
      isPanelCollapsed: false,
    }),

  getFilteredReports: () => {
    const { reports, searchQuery, sortBy, selectedCategory } = get();
    let filtered = [...reports];

    // Filter by category (problem type)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => {
        const problems = r.answers?.biggest_problems || "";
        return problems.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.answers?.community || "").toLowerCase().includes(q) ||
          (r.answers?.priority_problem || "").toLowerCase().includes(q) ||
          (r.answers?.occupation || "").toLowerCase().includes(q) ||
          r.phone.includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.submitted_at).getTime() -
            new Date(a.submitted_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.submitted_at).getTime() -
            new Date(b.submitted_at).getTime()
        );
        break;
      case "community-az":
        filtered.sort((a, b) =>
          (a.answers?.community || "").localeCompare(
            b.answers?.community || ""
          )
        );
        break;
      case "community-za":
        filtered.sort((a, b) =>
          (b.answers?.community || "").localeCompare(
            a.answers?.community || ""
          )
        );
        break;
    }

    return filtered;
  },
}));
