import OpenAI from "openai";

import type { RuntimeProviderConfig } from "@/lib/types";

export function getOpenAIClient(provider: RuntimeProviderConfig) {
  if (!provider.apiKey) {
    throw new Error("缺少 API Key，无法调用图片模型。");
  }

  if (!provider.baseUrl) {
    throw new Error("缺少 Base URL，无法调用图片模型。");
  }

  return new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseUrl
  });
}
