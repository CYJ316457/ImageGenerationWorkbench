import { toFile } from "openai/uploads";

import { IMAGE_MODEL } from "@/lib/config";
import { getOpenAIClient } from "@/lib/openai/client";
import type { ResolutionOption, RuntimeProviderConfig, UploadedImageInput } from "@/lib/types";

function normalizeSize(resolution: ResolutionOption) {
  return resolution === "auto" ? "auto" : resolution;
}

export async function generateImageFromPrompt(input: {
  prompt: string;
  resolution: ResolutionOption;
  provider: RuntimeProviderConfig;
}) {
  const client = getOpenAIClient(input.provider);
  const response = await client.images.generate({
    model: IMAGE_MODEL,
    prompt: input.prompt,
    size: normalizeSize(input.resolution),
    output_format: "png"
  });

  const image = response.data?.[0]?.b64_json;
  if (!image) {
    throw new Error("图片接口未返回可保存的图片内容。");
  }

  return {
    base64Data: image,
    contentType: "image/png"
  };
}

async function toSdkFile(image: UploadedImageInput) {
  return toFile(image.buffer, image.name, { type: image.contentType });
}

export async function editImageFromPrompt(input: {
  prompt: string;
  resolution: ResolutionOption;
  provider: RuntimeProviderConfig;
  sourceImage: UploadedImageInput;
  maskImage: UploadedImageInput | null;
}) {
  const client = getOpenAIClient(input.provider);
  const response = await client.images.edit({
    model: IMAGE_MODEL,
    prompt: input.prompt,
    image: await toSdkFile(input.sourceImage),
    mask: input.maskImage ? await toSdkFile(input.maskImage) : undefined,
    size: normalizeSize(input.resolution),
    output_format: "png"
  });

  const image = response.data?.[0]?.b64_json;
  if (!image) {
    throw new Error("图片编辑接口未返回可保存的图片内容。");
  }

  return {
    base64Data: image,
    contentType: "image/png"
  };
}
