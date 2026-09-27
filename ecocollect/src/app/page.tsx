"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPickupRequest } from "@/app/actions";
import { WasteCategory, WasteCategoryInfo } from "@/lib/types";
import {
  Recycle,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Leaf,
  Clock,
  MapPin,
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Phone,
  User,
  Check,
  HelpCircle,
} from "lucide-react";

const CATEGORIES: (WasteCategoryInfo & { iconName: string; carbonFactor: number })[] = [
  {
    id: "RECYCLABLE",
    label: "Recyclables",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Clean dry paper, corrugated cardboard, rigid plastics (#1, #2), tin and aluminum cans.",
    acceptedItems: ["Clean Corrugated Cardboard", "Plastic Bottles & Jugs", "Tin & Aluminum Cans", "Clean Glass Jars & Bottles"],
    restrictedItems: ["Greasy Pizza Boxes", "Styrofoam Containers", "Plastic Bags & Wraps"],
    iconName: "recycle",
    carbonFactor: 1.8,
  },
  {
    id: "ORGANIC",
    label: "Organic / Compost",
    badgeColor: "bg-lime-50 text-lime-800 border-lime-200",
    description: "Biodegradable food scraps, botanical trimmings, leaves, and compostable organic waste.",
    acceptedItems: ["Fruit & Vegetable Scraps", "Coffee Grounds & Paper Filters", "Yard Clippings & Prunings", "Eggshells & Tea Leaves"],
    restrictedItems: ["Treated Timber / Wood", "Pet Waste / Litter", "Synthetic Packaging"],
    iconName: "leaf",
    carbonFactor: 0.9,
  },
  {
    id: "E_WASTE",
    label: "Electronic Waste",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Obsolete computers, monitors, circuit boards, smartphones, cables, and home electronics.",
    acceptedItems: ["Laptops, PCs & Monitors", "Smartphones & Tablets", "Cables, Chargers & Mice", "Printers & Small Appliances"],
    restrictedItems: ["Leaking Wet Batteries", "Commercial Smoke Detectors", "Broken CRT Tubes"],
    iconName: "laptop",
    carbonFactor: 3.5,
  },
  {
    id: "HAZARDOUS",
    label: "Household Hazardous",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Specialized waste requiring certified chemical processing (paints, oils, household chemicals).",
    acceptedItems: ["Lithium & Rechargeable Batteries", "Oil-based Paint & Primers", "Household Cleaning Solvents", "Motor Oil & Automotive Fluids"],
    restrictedItems: ["Industrial Explosives", "Unidentified Laboratory Reagents", "Biohazard Needles (Unsealed)"],
    iconName: "alert",
    carbonFactor: 4.2,
  },
  {
    id: "BULKY",
    label: "Bulky Household",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Large domestic furniture, mattresses, and household appliances exceeding bin limits.",
    acceptedItems: ["Sofas, Armchairs & Desks", "Mattresses & Bedframes", "Refrigerators & Dishwashers", "Large Metal Scrap Items"],
    restrictedItems: ["Demolition Concrete / Bricks", "Hazardous Asbestos Siding", "Heavy Industrial Machinery"],
    iconName: "truck",
    carbonFactor: 2.1,
  },
];

const DEMO_CODES = [
  { code: "WST-RE8492", label: "Scheduled Recyclables", status: "SCHEDULED" },
  { code: "WST-EW1940", label: "In-Transit E-Waste", status: "IN_TRANSIT" },
  { code: "WST-BK3321", label: "Completed Bulky Item", status: "COMPLETED" },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory>("RECYCLABLE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackQuery, setTrackQuery] = useState("");
  const [volume, setVolume] = useState<"SMALL_BIN" | "MEDIUM_LOAD" | "TRUCK_LOAD">("MEDIUM_LOAD");

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory)!;

  // Approximate CO2 offset calculation
  const volumeMultiplier = volume === "SMALL_BIN" ? 8 : volume === "MEDIUM_LOAD" ? 25 : 75;
  const estimatedCO2 = Math.round(activeCategory.carbonFactor * volumeMultiplier);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("wasteCategory", selectedCategory);

    try {
      const response = await createPickupRequest(formData);
      if (response.success) {
        router.push(`/track/${response.trackingCode}`);
      }
    } catch {
      setIsSubmitting(false);
    }
  }

  function fillSampleData(form: HTMLFormElement | null) {
    if (!form) return;
    (form.elements.namedItem("contactName") as HTMLInputElement).value = "Alex Morgan";
    (form.elements.namedItem("contactPhone") as HTMLInputElement).value = "+1 (555) 389-4412";
    (form.elements.namedItem("pickupAddress") as HTMLInputElement).value = "742 Evergreen Terrace, Sector 5";
    (form.elements.namedItem("itemDescription") as HTMLTextAreaElement).value = "3 boxed monitors and assorted charging cables bagged neatly by side porch.";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700 text-white">
          LIVE DISPATCH
        </span>
        <span>EcoCollect Municipal Portal Active • 24/7 Verified Recycling & Eco-Pickup Network</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-500/30 text-white">
              <Recycle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">EcoCollect</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Municipal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">Smart Waste & Logistics Dispatch</p>
            </div>
          </div>

          {/* Quick Tracking Search in Nav */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Track code (e.g. WST-RE8492)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && trackQuery.trim()) {
                    router.push(`/track/${trackQuery.trim().toUpperCase()}`);
                  }
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white uppercase font-mono transition-all"
              />
            </div>
            <button
              onClick={() => trackQuery.trim() && router.push(`/track/${trackQuery.trim().toUpperCase()}`)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Track
            </button>
            <a
              href="/admin"
              className="ml-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all flex items-center gap-1"
            >
              Admin Dispatch →
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero-Landfill Civic Logistics System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Schedule Verified Civic Waste Pickups in Seconds
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Direct municipal collection for recyclables, e-waste, organic compost, and hazardous goods with live GPS-tracked dispatch.
          </p>

          {/* City Impact Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-10">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-emerald-600">18,450+ kg</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Recycled Materials</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-slate-900">99.4%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">On-Time Dispatch</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-emerald-600">42.8 Tons</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">CO₂ Offset Diverted</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-slate-900">3,120+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Pickups Completed</div>
            </div>
          </div>

          {/* Quick Demo Tracking Banner */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-600" /> Try Sample Track Codes:
            </span>
            {DEMO_CODES.map((demo) => (
              <button
                key={demo.code}
                onClick={() => router.push(`/track/${demo.code}`)}
                className="font-mono bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200 transition-colors"
              >
                {demo.code} <span className="text-[10px] text-slate-500">({demo.status})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Form Workspace */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        {/* Step 1: Waste Classification Selection */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 1 of 2</span>
              <h2 className="text-xl font-bold text-slate-900">Select Waste Stream Classification</h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">Compliant with Municipal Environmental Standards</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-500/50 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-emerald-700">
                    <span>~{cat.carbonFactor}x CO₂ Offset</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Accepted vs Prohibited Materials Card */}
          <div className="mt-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Accepted for {activeCategory.label}
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {activeCategory.acceptedItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
              <span className="text-xs font-bold text-rose-600 uppercase flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" /> Prohibited & Non-Conforming
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {activeCategory.restrictedItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 2: Logistics & Booking Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b pb-4 mb-6 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 2 of 2</span>
              <h2 className="text-xl font-bold text-slate-900">Pickup Logistics & Contact Verification</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const form = document.getElementById("pickup-form") as HTMLFormElement;
                fillSampleData(form);
              }}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              ⚡ Fill Sample Demo Data
            </button>
          </div>

          <form id="pickup-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Full Contact Name
                </label>
                <input
                  name="contactName"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Contact Phone
                </label>
                <input
                  name="contactPhone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Pickup Address & Civic Sector
                </label>
                <input
                  name="pickupAddress"
                  type="text"
                  required
                  placeholder="123 Civic Boulevard, Sector 4, Unit 201"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-slate-400" /> Estimated Load Volume
                </label>
                <select
                  name="estimatedVolume"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="SMALL_BIN">Small Bin (1–2 standard domestic bags)</option>
                  <option value="MEDIUM_LOAD">Medium Load (Cart/Trunk volume)</option>
                  <option value="TRUCK_LOAD">Truck Load (Full bed / Heavy batch)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Preferred Pickup Date
                </label>
                <input
                  name="preferredDate"
                  type="date"
                  required
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Logistics Window Slot
                </label>
                <select
                  name="preferredTimeSlot"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="MORNING_08_12">Morning Window (08:00 – 12:00 Dispatch)</option>
                  <option value="AFTERNOON_12_16">Afternoon Window (12:00 – 16:00 Dispatch)</option>
                  <option value="EVENING_16_20">Evening Window (16:00 – 20:00 Dispatch)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Item Manifest Description & Access Notes
                </label>
                <textarea
                  name="itemDescription"
                  rows={3}
                  placeholder="Describe items, placement (driveway, porch, garage), or security gate codes..."
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Environmental Impact Preview */}
            <div className="mt-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">Civic Eco-Impact Estimate</div>
                  <div className="text-xs text-emerald-800">
                    By responsibly diverting this load, you save approximately{" "}
                    <span className="font-extrabold text-emerald-900">{estimatedCO2} kg of CO₂</span> emissions.
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                100% Certified Civic Audit
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Your tracking token is generated immediately upon dispatch confirmation.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Generating Dispatch...</span>
                ) : (
                  <>
                    <span>Confirm & Schedule Dispatch</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* How It Works Section */}
        <section className="mt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900">How Municipal Eco-Dispatch Operates</h3>
            <p className="text-sm text-slate-600 mt-1">From doorstep pickup to verified recycling facility processing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Classify & Book</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your designated waste stream and logistics window. Receive an immutable tracking token code.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Route & Crew Assignment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Municipal dispatch matches your location with optimized low-emission routes and dedicated specialist crews.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Audit & Process</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Materials are weighed at certified sorting centers. View your real-time processing chain in citizen tracking.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-slate-800">EcoCollect Platform</span>
            <span>• Civic Waste & Resource Recovery</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-emerald-700 font-medium">Home</a>
            <a href="/admin" className="hover:text-emerald-700 font-medium">Admin Dashboard</a>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
