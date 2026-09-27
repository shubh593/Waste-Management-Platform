# EcoCollect: Smart Municipal Waste Collection & Dispatch Platform

EcoCollect is an end-to-end smart municipal logistics and waste management application. It streamlines citizen pickup requests, enforces municipal waste classification guidelines, provides automated carbon-offset calculations, and delivers an operational console for municipal dispatch crews to manage pickups and update collection lifecycles in real time.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment Status](https://img.shields.io/badge/Deployment-Live_on_Vercel-success?logo=vercel)](https://ecocollect-roan.vercel.app)

---

## 🌐 Live Production Deployment

* **Citizen Intake Portal**: [https://ecocollect-roan.vercel.app](https://ecocollect-roan.vercel.app)
* **Municipal Dispatch HQ**: [https://ecocollect-roan.vercel.app/admin](https://ecocollect-roan.vercel.app/admin)
* **Live Public Tracking Route**: [https://ecocollect-roan.vercel.app/track/WST-RE8492](https://ecocollect-roan.vercel.app/track/WST-RE8492)

---

## Architecture Overview

```text
               +-------------------------------------------------------+
               |                Client Layer (Browser)                 |
               |   Citizen Intake Portal | Public Token-Based Tracker  |
               |               Municipal Dispatch Console              |
               +---------------------------+---------------------------+
                                           |
                                  HTTPS / Server Actions
                                           |
               +---------------------------v---------------------------+
               |              Next.js 16+ Full-Stack Core              |
               |                                                       |
               |   App Router Routes:                                  |
               |     - / (Intake, Classification & Scheduling)         |
               |     - /track/[code] (Token-Based Live Stepper)        |
               |     - /admin (Fleet Operations & Dispatch Console)    |
               |                                                       |
               |   Server Actions (`src/app/actions.ts`):              |
               |     - createPickupRequest                             |
               |     - getRequestByTrackingCode                        |
               |     - getAllRequests                                  |
               |     - updateRequestStatus                             |
               +---------------------------+---------------------------+
                                           |
                      +--------------------+--------------------+
                      |                                         |
     (When GCP ADC Credentials Active)                 (Zero-Cost Fallback & Demo)
                      |                                         |
               +------v----------------+             +----------v--------------+
               |  Google Cloud         |             |  Resilient Local Store  |
               |  Firestore DB         |             |  (`src/lib/store.ts`)   |
               |  Collection:          |             |  - Persistent JSON      |
               |  `collection_requests`|             |  - Pre-seeded Requests  |
               +-----------------------+             +-------------------------+
```

---

## Key Features

1. **Intake & Waste Stream Education (`/`)**:
   - Multi-stream selector: **Recyclables**, **Organic / Compost**, **Electronic Waste**, **Household Hazardous**, and **Bulky Household**.
   - Dynamic municipal regulation inspector outlining **Accepted Materials** and **Prohibited & Non-Conforming Items**.
   - Logistics booking form collecting resident contact, pickup address, load volume estimate (`SMALL_BIN`, `MEDIUM_LOAD`, `TRUCK_LOAD`), and designated dispatch window (`MORNING_08_12`, `AFTERNOON_12_16`, `EVENING_16_20`).
   - Real-time **Civic Eco-Impact / Carbon Offset Calculator** estimating CO₂ emissions saved.
   - Quick **⚡ "Fill Sample Demo Data"** action for instant test submissions.

2. **Citizen Tracking Portal (`/track/[code]`)**:
   - Token-based tracking (e.g. `WST-RE8492`) accessible without resident authentication.
   - 4-stage visual status stepper: `PENDING` $\rightarrow$ `SCHEDULED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `COMPLETED` (or `CANCELLED`).
   - Detailed logistics card displaying assigned crew unit, pickup destination, and collection manifest.

3. **Municipal Operations Dashboard (`/admin`)**:
   - Operational telemetry: **Total Dispatch Queue**, **Pending Assignment**, **Active Fleet En Route**, and **Processed & Diverted**.
   - Multi-parameter live search and status filter tabs (*All, Pending, Scheduled, In Transit, Completed*).
   - In-line dispatch control to reassign status and assign designated electric fleet units (`CRW-XX`).

---

## Directory Structure

```text
Waste-Management-Platform/
├── README.md                          # Repository documentation
└── ecocollect/                        # Next.js Application Root
    ├── src/
    │   ├── app/
    │   │   ├── admin/
    │   │   │   └── page.tsx           # Municipal dispatch dashboard
    │   │   ├── track/
    │   │   │   └── [code]/
    │   │   │       └── page.tsx       # Citizen public tracking page
    │   │   ├── actions.ts             # Backend Server Actions (CRUD & dispatch)
    │   │   ├── globals.css            # Tailwind CSS configuration & tokens
    │   │   ├── layout.tsx             # Root layout, fonts, and metadata
    │   │   └── page.tsx               # Public landing & pickup scheduler
    │   └── lib/
    │       ├── firestore.ts           # Google Cloud Firestore ADC client
    │       ├── store.ts               # Resilient local persistent store & seed data
    │       └── types.ts               # Domain types, enums, and schemas
    ├── data/
    │   └── collection_requests.json   # Local persistent request records
    ├── .dockerignore
    ├── Dockerfile                     # Multi-stage production container build
    ├── next.config.mjs                # Next.js standalone output configuration
    ├── package.json
    └── tsconfig.json
```

---

## Document Schema (`CollectionRequest`)

```typescript
export interface CollectionRequest {
  id: string;                  // Unique record identifier
  trackingCode: string;        // Formatted citizen token (e.g., WST-RE8492)
  wasteCategory: WasteCategory;// "RECYCLABLE" | "ORGANIC" | "E_WASTE" | "HAZARDOUS" | "BULKY"
  estimatedVolume: VolumeEstimate; // "SMALL_BIN" | "MEDIUM_LOAD" | "TRUCK_LOAD"
  itemDescription: string;     // Free-text notes and manifest summary
  pickupAddress: string;       // Citizen pickup location & sector
  contactName: string;         // Citizen contact name
  contactPhone: string;        // Contact phone number
  preferredDate: string;       // ISO Date (YYYY-MM-DD)
  preferredTimeSlot: TimeSlot; // "MORNING_08_12" | "AFTERNOON_12_16" | "EVENING_16_20"
  status: RequestStatus;       // "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED"
  assignedCrew?: string;       // Assigned fleet unit (e.g. CRW-04)
  adminNotes?: string;         // Dispatch operations notes
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;           // ISO 8601 timestamp
}
```

---

## Getting Started Locally

### 1. Prerequisites
* **Node.js** 20+ installed
* **npm** 10+ installed

### 2. Installation
```bash
git clone https://github.com/shubh593/Waste-Management-Platform.git
cd Waste-Management-Platform/ecocollect
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
* **Citizen Portal**: `http://localhost:3000`
* **Admin Dashboard**: `http://localhost:3000/admin`
* **Sample Tracking**: `http://localhost:3000/track/WST-RE8492`

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Deployment Architectures

### Option A: Vercel (Live Production)
The application is pre-configured and deployed on Vercel:
```bash
cd ecocollect
npx vercel --prod
```
* **Production URL**: `https://ecocollect-roan.vercel.app`

### Option B: Google Cloud Run (Containerized Deployment)
The root includes a production-ready `Dockerfile` and `next.config.mjs` standalone build:
```bash
cd ecocollect
gcloud run deploy waste-management-platform \
    --source . \
    --region us-central1 \
    --port 8080 \
    --allow-unauthenticated \
    --min-instances 0 \
    --max-instances 2 \
    --memory 512Mi \
    --cpu 1
```

---

## License
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.