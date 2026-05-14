import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { ASSETS_DIR } from "@/lib/config";
import type { UploadedImageInput } from "@/lib/types";

const CONTENT_TYPE_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp"
};

export interface StorageAsset {
  assetId: string;
  buffer: Buffer;
  contentType: string;
}

export function createAssetStorage(baseDir = ASSETS_DIR) {
  async function ensureDir() {
    await mkdir(baseDir, { recursive: true });
  }

  async function saveBuffer(buffer: Buffer, contentType: string) {
    await ensureDir();
    const extension = CONTENT_TYPE_TO_EXTENSION[contentType] ?? "bin";
    const assetId = `${randomUUID()}.${extension}`;
    const filePath = path.join(baseDir, assetId);
    await writeFile(filePath, buffer);
    return assetId;
  }

  return {
    async saveUploadedImage(file: UploadedImageInput) {
      return saveBuffer(file.buffer, file.contentType);
    },
    async saveGeneratedImage(base64Data: string, contentType = "image/png") {
      const buffer = Buffer.from(base64Data, "base64");
      return saveBuffer(buffer, contentType);
    },
    async readAsset(assetId: string): Promise<StorageAsset> {
      const filePath = path.join(baseDir, assetId);
      const extension = path.extname(assetId).replace(".", "");
      const contentType =
        Object.entries(CONTENT_TYPE_TO_EXTENSION).find(([, value]) => value === extension)?.[0] ??
        "application/octet-stream";

      return {
        assetId,
        buffer: await readFile(filePath),
        contentType
      };
    },
    buildAssetUrl(assetId: string | null) {
      return assetId ? `/api/assets/${encodeURIComponent(assetId)}` : null;
    }
  };
}
