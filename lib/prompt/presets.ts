import type { StylePreset, StylePresetId } from "@/lib/types";

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "none",
    label: "不套风格",
    summary: "保留你的原始表达，仅做轻量结构化优化。",
    promptFragment: "",
    recommendedFor: "想先看模型自然输出时使用。"
  },
  {
    id: "cinematic",
    label: "电影感",
    summary: "高反差、叙事性镜头、cinematic lighting。",
    promptFragment:
      "cinematic lighting, dramatic composition, rich atmosphere, detailed color grading, premium poster quality",
    recommendedFor: "海报、情绪片、故事性强的主视觉。"
  },
  {
    id: "product",
    label: "产品广告",
    summary: "商业级产品陈列与干净灯光。",
    promptFragment:
      "commercial product photography, controlled studio lighting, premium materials, crisp reflections, polished marketing image",
    recommendedFor: "产品页、广告图、封面图。"
  },
  {
    id: "anime",
    label: "动漫插画",
    summary: "清晰线稿、鲜明配色、角色表现力强。",
    promptFragment:
      "anime illustration, expressive character design, clean linework, vibrant palette, high-detail cel shading",
    recommendedFor: "二次元角色、概念图、插画封面。"
  },
  {
    id: "editorial",
    label: "时尚大片",
    summary: "高级编辑感、留白和镜头感更强。",
    promptFragment:
      "editorial fashion photography, premium magazine composition, confident styling, elegant contrast, refined visual hierarchy",
    recommendedFor: "时尚、品牌、人物视觉。"
  },
  {
    id: "xiaomi-poster",
    label: "科技海报",
    summary: "科技品牌海报语言，突出速度与质感。",
    promptFragment:
      "futuristic tech poster, premium automotive styling, precise reflections, dynamic perspective, clean typography-safe composition",
    recommendedFor: "汽车、数码、科技品牌海报。"
  }
];

export function getStylePreset(styleId: StylePresetId): StylePreset {
  return STYLE_PRESETS.find((preset) => preset.id === styleId) ?? STYLE_PRESETS[0];
}
