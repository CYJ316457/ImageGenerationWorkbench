import { describe, expect, it } from "vitest";

import { buildOptimizedPrompt } from "@/lib/prompt/optimizer";

describe("buildOptimizedPrompt", () => {
  it("adds style guidance and keeps original intent visible", () => {
    const result = buildOptimizedPrompt({
      mode: "generate",
      originalPrompt: "做一张小米汽车在海边黄昏的海报",
      styleId: "cinematic",
      resolution: "1536x1024",
      enableOptimization: true
    });

    expect(result.originalPrompt).toContain("小米汽车");
    expect(result.optimizedPrompt).toContain("cinematic lighting");
    expect(result.optimizedPrompt).toContain("1536x1024");
    expect(result.summary).toContain("电影感");
  });

  it("returns the original prompt when optimization is disabled", () => {
    const result = buildOptimizedPrompt({
      mode: "generate",
      originalPrompt: "猫坐在窗边",
      styleId: "none",
      resolution: "auto",
      enableOptimization: false
    });

    expect(result.optimizedPrompt).toBe("猫坐在窗边");
  });
});
