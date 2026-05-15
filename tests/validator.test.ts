import { describe, expect, it } from "vitest";

import { validateEditInput, validateGenerateInput } from "@/lib/validators/image-request";

describe("image request validators", () => {
  it("rejects an empty prompt for generation", () => {
    const result = validateGenerateInput({
      prompt: "   ",
      styleId: "none",
      resolution: "auto",
      enableOptimization: true,
      protocol: "images",
      provider: {
        baseUrl: "https://api.openai.com/v1",
        apiKey: "sk-test"
      }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("prompt");
    }
  });

  it("accepts a valid generate request and normalizes provider fields", () => {
    const result = validateGenerateInput({
      prompt: "产品海报",
      styleId: "product",
      resolution: "1024x1024",
      enableOptimization: true,
      protocol: "images",
      provider: {
        baseUrl: "https://api.openai.com/v1/",
        apiKey: "  sk-test  "
      }
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.resolution).toBe("1024x1024");
      expect(result.data.protocol).toBe("images");
      expect(result.data.provider.baseUrl).toBe("https://api.openai.com/v1");
      expect(result.data.provider.apiKey).toBe("sk-test");
    }
  });

  it("rejects a missing runtime api key", () => {
    const result = validateGenerateInput({
      prompt: "产品海报",
      styleId: "product",
      resolution: "1024x1024",
      enableOptimization: true,
      protocol: "images",
      provider: {
        baseUrl: "https://api.openai.com/v1",
        apiKey: "   "
      }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("provider.apiKey");
    }
  });

  it("rejects an invalid runtime base url", () => {
    const result = validateGenerateInput({
      prompt: "产品海报",
      styleId: "product",
      resolution: "1024x1024",
      enableOptimization: true,
      protocol: "responses",
      provider: {
        baseUrl: "not-a-url",
        apiKey: "sk-test"
      }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("provider.baseUrl");
    }
  });

  it("rejects an invalid protocol", () => {
    const result = validateGenerateInput({
      prompt: "产品海报",
      styleId: "product",
      resolution: "1024x1024",
      enableOptimization: true,
      protocol: "invalid" as never,
      provider: {
        baseUrl: "https://api.openai.com/v1",
        apiKey: "sk-test"
      }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("protocol");
    }
  });

  it("requires a source image for edit requests", () => {
    const result = validateEditInput({
      prompt: "把背景改成雪山",
      styleId: "cinematic",
      resolution: "1024x1024",
      enableOptimization: true,
      protocol: "images",
      provider: {
        baseUrl: "https://api.openai.com/v1",
        apiKey: "sk-test"
      },
      sourceImage: null,
      maskImage: null
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("sourceImage");
    }
  });
});
