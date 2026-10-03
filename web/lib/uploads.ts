import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { MAX_PHOTOS } from "./shipments";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function uploadsDir(): string {
  const override = process.env.UPLOADS_DIR?.trim();
  if (override) return override;
  return path.join(process.cwd(), "data", "uploads");
}

export async function saveUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are accepted");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Photo must be 5 MB or smaller");
  }
  const key = `${randomUUID()}.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await mkdir(uploadsDir(), { recursive: true });
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toFile(path.join(uploadsDir(), key));
  return key;
}

export function uploadPath(key: string): string {
  return path.join(uploadsDir(), path.basename(key));
}

export { MAX_PHOTOS };
