import type {
  ResponseInputItem,
  ResponseInputMessageContentList
} from "openai/resources/responses/responses";
import { toFile } from "openai/uploads";

import { IMAGE_MODEL, RESPONSES_MODEL } from "@/lib/config";
import { getOpenAIClient } from "@/lib/openai/client";
import type {
  ImageProtocol,
  ResolutionOption,
  RuntimeProviderConfig,
  UploadedImageInput
} from "@/lib/types";

function normalizeSize(resolution: ResolutionOption) {
  return resolution === "auto" ? "auto" : resolution;
}

function toDataUrl(file: UploadedImageInput) {
  return `data:${file.contentType};base64,${file.buffer.toString("base64")}`;
}

function buildResponsesMessage(content: ResponseInputMessageContentList): ResponseInputItem[] {
  return [
    {
      type: "message",
      role: "user",
      content
    }
  ];
}

function extractBase64Image(output: unknown) {
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as {
      type?: string;
      result?: string;
      image_base64?: string;
    };

    if (candidate.type === "image_generation_call") {
      return candidate.result ?? candidate.image_base64 ?? null;
    }
  }

  return null;
}

async function generateWithImagesApi(input: {
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

async function generateWithResponsesApi(input: {
  prompt: string;
  resolution: ResolutionOption;
  provider: RuntimeProviderConfig;
}) {
  const client = getOpenAIClient(input.provider);
  const response = await client.responses.create({
    model: RESPONSES_MODEL,
    input: input.prompt,
    tools: [
      {
        type: "image_generation",
        size: normalizeSize(input.resolution)
      }
    ]
  });

  const image = extractBase64Image(response.output);
  if (!image) {
    throw new Error("Responses 协议未返回可保存的图片内容。");
  }

  return {
    base64Data: image,
    contentType: "image/png"
  };
}

async function toSdkFile(image: UploadedImageInput) {
  return toFile(image.buffer, image.name, { type: image.contentType });
}

async function editWithImagesApi(input: {
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

async function editWithResponsesApi(input: {
  prompt: string;
  resolution: ResolutionOption;
  provider: RuntimeProviderConfig;
  sourceImage: UploadedImageInput;
  maskImage: UploadedImageInput | null;
}) {
  const client = getOpenAIClient(input.provider);
  const content: ResponseInputMessageContentList = [
    { type: "input_text", text: input.prompt },
    { type: "input_image", image_url: toDataUrl(input.sourceImage), detail: "auto" }
  ];

  if (input.maskImage) {
    content.push({
      type: "input_text",
      text: "第二张图是蒙版。请仅修改蒙版高亮区域，其余区域尽量保持原图不变。"
    });
    content.push({
      type: "input_image",
      image_url: toDataUrl(input.maskImage),
      detail: "auto"
    });
  }

  const response = await client.responses.create({
    model: RESPONSES_MODEL,
    input: buildResponsesMessage(content),
    tools: [
      {
        type: "image_generation",
        size: normalizeSize(input.resolution),
        partial_images: 0
      }
    ]
  });

  const image = extractBase64Image(response.output);
  if (!image) {
    throw new Error("Responses 编辑协议未返回可保存的图片内容。");
  }

  return {
    base64Data: image,
    contentType: "image/png"
  };
}

export async function generateImageFromPrompt(input: {
  prompt: string;
  resolution: ResolutionOption;
  protocol: ImageProtocol;
  provider: RuntimeProviderConfig;
}) {
  if (input.protocol === "responses") {
    return generateWithResponsesApi(input);
  }

  return generateWithImagesApi(input);
}

export async function editImageFromPrompt(input: {
  prompt: string;
  resolution: ResolutionOption;
  protocol: ImageProtocol;
  provider: RuntimeProviderConfig;
  sourceImage: UploadedImageInput;
  maskImage: UploadedImageInput | null;
}) {
  if (input.protocol === "responses") {
    return editWithResponsesApi(input);
  }

  return editWithImagesApi(input);
}
