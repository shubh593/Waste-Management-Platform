"use server";

import { getFirestoreDb, COLLECTION_NAME } from "@/lib/firestore";
import {
  readLocalRequests,
  saveLocalRequest,
  findLocalRequestByTrackingCode,
} from "@/lib/store";
import {
  CollectionRequest,
  RequestStatus,
  WasteCategory,
  VolumeEstimate,
  TimeSlot,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "WST-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createPickupRequest(formData: FormData) {
  const trackingCode = generateTrackingCode();
  const timestamp = new Date().toISOString();
  const id = "req_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

  const requestPayload: CollectionRequest = {
    id,
    trackingCode,
    wasteCategory: formData.get("wasteCategory") as WasteCategory,
    estimatedVolume: formData.get("estimatedVolume") as VolumeEstimate,
    itemDescription: (formData.get("itemDescription") as string) || "",
    pickupAddress: formData.get("pickupAddress") as string,
    contactName: formData.get("contactName") as string,
    contactPhone: formData.get("contactPhone") as string,
    preferredDate: formData.get("preferredDate") as string,
    preferredTimeSlot: formData.get("preferredTimeSlot") as TimeSlot,
    status: "PENDING",
    adminNotes: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Attempt to save in Firestore if available; always persist to resilient store
  try {
    const db = getFirestoreDb();
    if (db) {
      const newDocRef = db.collection(COLLECTION_NAME).doc(id);
      await newDocRef.set(requestPayload);
    }
  } catch {
    // Firestore not connected or billing disabled; saved locally
  }

  await saveLocalRequest(requestPayload);
  return { success: true, trackingCode };
}

export async function getRequestByTrackingCode(
  trackingCode: string
): Promise<CollectionRequest | null> {
  const normalized = trackingCode.trim().toUpperCase();

  try {
    const db = getFirestoreDb();
    if (db) {
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .where("trackingCode", "==", normalized)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs[0].data() as CollectionRequest;
      }
    }
  } catch {
    // Fallback to local storage
  }

  return await findLocalRequestByTrackingCode(normalized);
}

export async function getAllRequests(): Promise<CollectionRequest[]> {
  try {
    const db = getFirestoreDb();
    if (db) {
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .orderBy("createdAt", "desc")
        .get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as CollectionRequest);
      }
    }
  } catch {
    // Fallback to local storage
  }

  return await readLocalRequests();
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  assignedCrew?: string,
  adminNotes?: string
) {
  const timestamp = new Date().toISOString();

  // Try updating Firestore
  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      const updateData: Partial<CollectionRequest> = {
        status,
        updatedAt: timestamp,
      };
      if (assignedCrew !== undefined) updateData.assignedCrew = assignedCrew;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      await docRef.update(updateData);
    }
  } catch {
    // Fallback update
  }

  // Update in local store
  const all = await readLocalRequests();
  const existing = all.find((r) => r.id === id);
  if (existing) {
    existing.status = status;
    existing.updatedAt = timestamp;
    if (assignedCrew !== undefined) existing.assignedCrew = assignedCrew;
    if (adminNotes !== undefined) existing.adminNotes = adminNotes;
    await saveLocalRequest(existing);
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function handleAdminUpdate(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as RequestStatus;
  const crew = (formData.get("crew") as string) || undefined;
  if (!id) return;
  await updateRequestStatus(id, status, crew);
}
