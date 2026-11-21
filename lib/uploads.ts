import { MongoClient, type Binary } from "mongodb"

/**
 * Uploaded images (profile photos and service photos) are stored in MongoDB
 * and streamed back through /api/profile-photo/[id] or /api/service-photo/[id].
 * That keeps uploads working without an external storage provider.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export type StoredImage = {
  contentType: string
  size: number
  data: Binary
  createdAt: Date
}

// Reuse one client across hot reloads so dev doesn't open a connection per edit.
const globalForUploads = globalThis as unknown as {
  uploadsClient?: MongoClient
}

function getClient() {
  if (!globalForUploads.uploadsClient) {
    globalForUploads.uploadsClient = new MongoClient(
      process.env.DB_URI as string
    )
  }

  return globalForUploads.uploadsClient
}

/** Shared by profile and service photos. */
export function imageUploads() {
  return getClient().db("wedplandb").collection<StoredImage>("profilePhotos")
}
