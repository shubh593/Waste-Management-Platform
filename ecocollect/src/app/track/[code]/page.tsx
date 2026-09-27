import { getRequestByTrackingCode } from "@/app/actions";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Calendar,
  Package,
  Recycle,
  User,
  Phone,
  ArrowLeft,
  Share2,
  ShieldCheck,
} from "lucide-react";

const STAGES = [
  { status: "PENDING", label: "Request Submitted", desc: "Order received in municipal dispatch queue" },
  { status: "SCHEDULED", label: "Crew Assigned", desc: "Route plotted and logistics window locked" },
  { status: "IN_TRANSIT", label: "Driver In Transit", desc: "Eco-collection vehicle en route to location" },
  { status: "COMPLETED", label: "Collected & Processed", desc: "Weighed & transferred to eco-recycling plant" },
];

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ code: string }> | { code: string };
}) {
  const resolvedParams = await params;
  const request = await getRequestByTrackingCode(resolvedParams.code);

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Request Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            No collection record matches token <span className="font-mono font-bold text-slate-800">{resolvedParams.code}</span>.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Citizen Portal
          </a>
        </div>
      </div>
    );
  }

  const currentIdx = STAGES.findIndex((s) => s.status === request.status);
  const isCancelled = request.status === "CANCELLED";

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    SCHEDULED: "bg-blue-50 text-blue-800 border-blue-200",
    IN_TRANSIT: "bg-indigo-50 text-indigo-800 border-indigo-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-slate-800 hover:text-emerald-700 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Recycle className="h-5 w-5" />
            </div>
            <span className="font-black text-lg">EcoCollect</span>
          </a>

          <div className="flex items-center gap-3">
            <a href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              ← New Request
            </a>
            <a href="/admin" className="text-xs font-semibold text-emerald-700 hover:underline">
              Admin Console →
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Header Card */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Official Dispatch Tracking Token
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-tight">
                  {request.trackingCode}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[request.status] || "bg-slate-100 text-slate-800"}`}>
                  {request.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Created: {new Date(request.createdAt).toLocaleDateString()}</div>
              <div className="font-semibold text-slate-700">Slot: {request.preferredTimeSlot.replace(/_/g, " ")}</div>
            </div>
          </div>

          {/* Stepper Progress */}
          {!isCancelled ? (
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isFuture = idx > currentIdx;

                  return (
                    <div key={stage.status} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-sm"
                            : isCurrent
                            ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-600 ring-4 ring-emerald-50"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>

                      <div>
                        <div className={`text-xs font-bold ${isCurrent ? "text-emerald-800" : isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                          {stage.label}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block leading-tight">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs">
              <span className="font-bold">Cancellation Notice:</span> This collection order was marked cancelled. Contact municipal dispatch for queries.
            </div>
          )}

          {/* Logistics Details Grid */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Manifest & Logistics Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Waste Stream</span>
                <span className="font-bold text-sm text-slate-900">{request.wasteCategory}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Estimated Volume</span>
                <span className="font-bold text-sm text-slate-900">{request.estimatedVolume.replace(/_/g, " ")}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Scheduled Date</span>
                <span className="font-bold text-sm text-slate-900">{request.preferredDate}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Assigned Crew</span>
                <span className="font-bold text-sm text-emerald-800 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  {request.assignedCrew || "Pending Dispatch Routing"}
                </span>
              </div>

              <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Pickup Destination</span>
                <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  {request.pickupAddress}
                </span>
              </div>

              {request.itemDescription && (
                <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Manifest Description & Access Notes</span>
                  <p className="text-xs text-slate-700 mt-1">{request.itemDescription}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-3">
              <a
                href="/"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                ← Schedule Another Pickup
              </a>

              <div className="text-[11px] text-slate-400">
                Last synchronized: {new Date(request.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
