import path from "node:path";

export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

export const APP_NAME = "生图工作台";

export const DATA_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "data");

export const TASKS_DIR = path.join(DATA_DIR, "tasks");

export const ASSETS_DIR = path.join(DATA_DIR, "assets");

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);

export const ALLOWED_MASK_TYPES = new Set(["image/png"]);
