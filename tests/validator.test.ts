import { describe, expect, it } from "vitest";

import { validateGenerateInput, validateEditInput } from "@/lib/validators/image-request";

describe("image request validators", () => {
  it("rejects an empty prompt for generation", () => {
    const result = validateGenerateInput({
      prompt: "   ",
      styleId: "none",
      resolution: "auto",
      enableOptimization: true
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("提示词");
    }
  });

  it("accepts a valid generate request", () => {
    const result = validateGenerateInput({
      prompt: "产品海报",
      styleId: "product",
      resolution: "1024x1024",
      enableOptimization: true
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.resolution).toBe("1024x1024");
    }
  });

  it("requires a source image for edit requests", () => {
    const result = validateEditInput({
      prompt: "把背景改成雪山",
      styleId: "cinematic",
      resolution: "1024x1024",
      enableOptimization: true,
      sourceImage: null,
      maskImage: null
    });

    expect(result.ok).toBe(false);
  });
});
