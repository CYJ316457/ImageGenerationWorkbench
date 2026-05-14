import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY，无法调用图片模型。");
  }

  return new OpenAI({ apiKey });
}
