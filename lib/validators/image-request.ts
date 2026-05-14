import { ALLOWED_IMAGE_TYPES, ALLOWED_MASK_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/config";
import { STYLE_PRESETS } from "@/lib/prompt/presets";
import type {
  EditFormInput,
  GenerateFormInput,
  ResolutionOption,
  StylePresetId,
  UploadedImageInput,
  ValidationResult
} from "@/lib/types";

const ALLOWED_RESOLUTIONS = new Set<ResolutionOption>(["auto", "1024x1024", "1536x1024", "1024x1536"]);
const ALLOWED_STYLE_IDS = new Set<StylePresetId>(STYLE_PRESETS.map((preset) => preset.id));

function validateCommon(input: GenerateFormInput): ValidationResult<GenerateFormInput> {
  if (!input.prompt.trim()) {
    return {
      ok: false,
      error: {
        field: "prompt",
        message: "提示词不能为空。"
      }
    };
  }

  if (input.prompt.trim().length > 1200) {
    return {
      ok: false,
      error: {
        field: "prompt",
        message: "提示词过长，请控制在 1200 个字符以内。"
      }
    };
  }

  if (!ALLOWED_STYLE_IDS.has(input.styleId)) {
    return {
      ok: false,
      error: {
        field: "styleId",
        message: "风格预设不存在。"
      }
    };
  }

  if (!ALLOWED_RESOLUTIONS.has(input.resolution)) {
    return {
      ok: false,
      error: {
        field: "resolution",
        message: "分辨率选项无效。"
      }
    };
  }

  return {
    ok: true,
    data: {
      ...input,
      prompt: input.prompt.trim()
    }
  };
}

function validateUploadedImage(
  file: UploadedImageInput,
  options: { field: string; allowTypes: Set<string> }
): ValidationResult<UploadedImageInput> {
  if (!options.allowTypes.has(file.contentType)) {
    return {
      ok: false,
      error: {
        field: options.field,
        message: "上传文件格式不支持，请使用 PNG、JPEG 或 WebP 图片。"
      }
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      error: {
        field: options.field,
        message: "上传文件不能为空。"
      }
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      ok: false,
      error: {
        field: options.field,
        message: "上传文件超过 20MB，请压缩后重试。"
      }
    };
  }

  return {
    ok: true,
    data: file
  };
}

export function validateGenerateInput(input: GenerateFormInput): ValidationResult<GenerateFormInput> {
  return validateCommon(input);
}

export function validateEditInput(input: EditFormInput): ValidationResult<EditFormInput> {
  const common = validateCommon(input);

  if (!common.ok) {
    return common;
  }

  if (!input.sourceImage) {
    return {
      ok: false,
      error: {
        field: "sourceImage",
        message: "编辑图片时必须上传原图。"
      }
    };
  }

  const sourceValidation = validateUploadedImage(input.sourceImage, {
    field: "sourceImage",
    allowTypes: ALLOWED_IMAGE_TYPES
  });

  if (!sourceValidation.ok) {
    return sourceValidation;
  }

  if (input.maskImage) {
    const maskValidation = validateUploadedImage(input.maskImage, {
      field: "maskImage",
      allowTypes: ALLOWED_MASK_TYPES
    });

    if (!maskValidation.ok) {
      return maskValidation;
    }
  }

  return {
    ok: true,
    data: {
      ...common.data,
      sourceImage: input.sourceImage,
      maskImage: input.maskImage
    }
  };
}
