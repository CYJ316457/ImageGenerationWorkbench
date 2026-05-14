import { getStylePreset } from "@/lib/prompt/presets";
import type { OptimizedPromptResult, ResolutionOption, StylePresetId, TaskMode } from "@/lib/types";

interface BuildPromptInput {
  mode: TaskMode;
  originalPrompt: string;
  styleId: StylePresetId;
  resolution: ResolutionOption;
  enableOptimization: boolean;
}

function buildResolutionHint(resolution: ResolutionOption): string {
  if (resolution === "auto") {
    return "Choose the most suitable aspect ratio automatically while keeping a balanced composition.";
  }

  return `Compose the image to fit ${resolution} while preserving a strong subject focus and readable negative space.`;
}

function buildModeHint(mode: TaskMode): string {
  return mode === "edit"
    ? "This is an image edit request. Preserve the key identity of the source image unless the prompt explicitly asks for changes."
    : "Create a fresh original composition from the prompt without reusing an existing source image.";
}

export function buildOptimizedPrompt(input: BuildPromptInput): OptimizedPromptResult {
  const cleanedPrompt = input.originalPrompt.trim();
  const preset = getStylePreset(input.styleId);

  if (!input.enableOptimization) {
    return {
      originalPrompt: cleanedPrompt,
      optimizedPrompt: cleanedPrompt,
      summary: `${preset.label} · ${input.resolution === "auto" ? "自动分辨率" : input.resolution}`,
      styleLabel: preset.label
    };
  }

  const promptParts = [
    `Primary intent: ${cleanedPrompt}.`,
    buildModeHint(input.mode),
    buildResolutionHint(input.resolution),
    preset.promptFragment ? `Style direction: ${preset.promptFragment}.` : "",
    "Prioritize subject clarity, realistic material response, coherent lighting, and production-ready detail.",
    "Avoid muddy composition, low-detail artifacts, broken anatomy, duplicated elements, and unreadable backgrounds."
  ].filter(Boolean);

  return {
    originalPrompt: cleanedPrompt,
    optimizedPrompt: promptParts.join("\n"),
    summary: `${preset.label} · ${input.resolution === "auto" ? "自动分辨率" : input.resolution} · ${preset.summary}`,
    styleLabel: preset.label
  };
}
