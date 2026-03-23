import { getReports } from "@/lib/session";
import type { Report } from "@/lib/types";
import { ReportsTable } from "./reports-table";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reports = await getReports();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Survey Reports</h2>
        <span className="text-sm text-gray-500">
          {reports.length} report{reports.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ReportsTable reports={reports} />
    </div>
  );
}
