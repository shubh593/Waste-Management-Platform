import { getAllRequests, handleAdminUpdate } from "@/app/actions";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Recycle,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; query?: string }> | { status?: string; category?: string; query?: string };
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const allRequests = await getAllRequests();

  const total = allRequests.length;
  const pending = allRequests.filter((r) => r.status === "PENDING").length;
  const scheduled = allRequests.filter((r) => r.status === "SCHEDULED").length;
  const inTransit = allRequests.filter((r) => r.status === "IN_TRANSIT").length;
  const completed = allRequests.filter((r) => r.status === "COMPLETED").length;

  const currentStatusFilter = resolvedSearchParams.status || "";
  const currentCategoryFilter = resolvedSearchParams.category || "";

  const filtered = allRequests.filter((r) => {
    if (currentStatusFilter && r.status !== currentStatusFilter) return false;
    if (currentCategoryFilter && r.wasteCategory !== currentCategoryFilter) return false;
    if (resolvedSearchParams.query) {
      const q = resolvedSearchParams.query.toLowerCase();
      return (
        r.trackingCode.toLowerCase().includes(q) ||
        r.contactName.toLowerCase().includes(q) ||
        r.pickupAddress.toLowerCase().includes(q) ||
        (r.assignedCrew && r.assignedCrew.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const categoryBadges: Record<string, string> = {
    RECYCLABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ORGANIC: "bg-lime-50 text-lime-800 border-lime-200",
    E_WASTE: "bg-blue-50 text-blue-700 border-blue-200",
    HAZARDOUS: "bg-rose-50 text-rose-700 border-rose-200",
    BULKY: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="border-b bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Recycle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">EcoCollect Dispatch HQ</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Municipal Command
                </span>
              </div>
              <p className="text-xs text-slate-400">Live Logistics & Fleet Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync Active
            </span>
            <span className="text-slate-600">|</span>
            <a
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              ← Citizen Portal
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Dispatch Queue</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
              <div className="text-[10px] text-slate-400 mt-0.5">Across all civic sectors</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-600 font-bold uppercase tracking-wider">Pending Assignment</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{pending}</p>
              <div className="text-[10px] text-slate-400 mt-0.5">Awaiting crew dispatch</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">En Route / Scheduled</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{inTransit + scheduled}</p>
              <div className="text-[10px] text-slate-400 mt-0.5">Active electric fleet</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Processed & Diverted</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{completed}</p>
              <div className="text-[10px] text-slate-400 mt-0.5">Weighed & eco-sorted</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <a
                href="/admin"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  !currentStatusFilter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({total})
              </a>
              <a
                href="/admin?status=PENDING"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentStatusFilter === "PENDING"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Pending ({pending})
              </a>
              <a
                href="/admin?status=SCHEDULED"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentStatusFilter === "SCHEDULED"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                Scheduled ({scheduled})
              </a>
              <a
                href="/admin?status=IN_TRANSIT"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentStatusFilter === "IN_TRANSIT"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                }`}
              >
                In Transit ({inTransit})
              </a>
              <a
                href="/admin?status=COMPLETED"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentStatusFilter === "COMPLETED"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Completed ({completed})
              </a>
            </div>

            {/* Search Box */}
            <form className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="query"
                  defaultValue={resolvedSearchParams.query || ""}
                  placeholder="Filter code, address, crew..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-slate-800"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold shadow-sm transition-all"
              >
                Search
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Tracking Token</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Resident Contact</th>
                  <th className="p-3.5">Pickup Destination</th>
                  <th className="p-3.5">Scheduled Slot</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Crew Unit</th>
                  <th className="p-3.5 text-right">Quick Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      <a
                        href={`/track/${item.trackingCode}`}
                        className="text-emerald-700 hover:underline flex items-center gap-1"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.trackingCode}
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${categoryBadges[item.wasteCategory] || "bg-slate-100 text-slate-800"}`}>
                        {item.wasteCategory}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{item.contactName}</div>
                      <div className="text-[10px] text-slate-400">{item.contactPhone}</div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="truncate text-slate-800">{item.pickupAddress}</div>
                      {item.itemDescription && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.itemDescription}</div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{item.preferredDate}</div>
                      <div className="text-[10px] text-slate-400">{item.preferredTimeSlot.replace(/_/g, " ")}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusStyles[item.status] || "bg-slate-100 text-slate-800"}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">
                      {item.assignedCrew || <span className="text-slate-300">Unassigned</span>}
                    </td>

                    <td className="p-3.5 text-right">
                      <form action={handleAdminUpdate} className="inline-flex items-center gap-1.5 justify-end">
                        <input type="hidden" name="id" value={item.id} />
                        <select
                          name="status"
                          defaultValue={item.status}
                          className="border border-slate-300 rounded text-xs px-2 py-1 bg-white outline-none focus:border-slate-800"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="IN_TRANSIT">IN TRANSIT</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <input
                          type="text"
                          name="crew"
                          placeholder="Crew ID"
                          defaultValue={item.assignedCrew || ""}
                          className="border border-slate-300 rounded text-xs px-2 py-1 w-24 bg-white outline-none focus:border-slate-800"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors shadow-sm"
                        >
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-12 text-slate-400">
                      <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <div className="font-semibold text-slate-600">No collection requests match your filters.</div>
                      <div className="text-[11px] text-slate-400 mt-1">Try resetting the search query or status filter.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
