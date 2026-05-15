export type TaskMode = "generate" | "edit";

export type TaskStatus = "queued" | "running" | "succeeded" | "failed";

export type ResolutionOption = "auto" | "1024x1024" | "1536x1024" | "1024x1536";
export type ImageProtocol = "images" | "responses";

export type StylePresetId =
  | "none"
  | "cinematic"
  | "product"
  | "anime"
  | "editorial"
  | "xiaomi-poster";

export interface StylePreset {
  id: StylePresetId;
  label: string;
  summary: string;
  promptFragment: string;
  recommendedFor: string;
}

export interface ImageTask {
  id: string;
  mode: TaskMode;
  status: TaskStatus;
  originalPrompt: string;
  optimizedPrompt: string;
  styleId: StylePresetId;
  resolution: ResolutionOption;
  createdAt: string;
  updatedAt: string;
  sourceImageAssetId: string | null;
  maskImageAssetId: string | null;
  outputAssetIds: string[];
  errorMessage: string | null;
}

export interface ImageTaskSummary extends ImageTask {
  sourceImageUrl: string | null;
  maskImageUrl: string | null;
  outputUrls: string[];
  styleLabel: string;
}

export interface RuntimeProviderConfig {
  baseUrl: string;
  apiKey: string;
}

export interface GenerateFormInput {
  prompt: string;
  styleId: StylePresetId;
  resolution: ResolutionOption;
  enableOptimization: boolean;
  protocol: ImageProtocol;
  provider: RuntimeProviderConfig;
}

export interface UploadedImageInput {
  name: string;
  contentType: string;
  buffer: Buffer;
  size: number;
}

export interface EditFormInput extends GenerateFormInput {
  sourceImage: UploadedImageInput | null;
  maskImage: UploadedImageInput | null;
}

export interface ValidationErrorPayload {
  message: string;
  field?: string;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ValidationErrorPayload };

export interface OptimizedPromptResult {
  originalPrompt: string;
  optimizedPrompt: string;
  summary: string;
  styleLabel: string;
}
