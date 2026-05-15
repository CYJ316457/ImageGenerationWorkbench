"use client";

import { useEffect, useMemo, useState } from "react";

import { TaskList } from "@/components/history/TaskList";
import { ImageEditorUpload } from "@/components/workbench/ImageEditorUpload";
import { PromptEditor } from "@/components/workbench/PromptEditor";
import { ProtocolPicker } from "@/components/workbench/ProtocolPicker";
import { ResolutionPicker } from "@/components/workbench/ResolutionPicker";
import { ResultStage } from "@/components/workbench/ResultStage";
import { RuntimeConfigPanel } from "@/components/workbench/RuntimeConfigPanel";
import { StylePresetPanel } from "@/components/workbench/StylePresetPanel";
import { buildOptimizedPrompt } from "@/lib/prompt/optimizer";
import type {
  ImageProtocol,
  ImageTaskSummary,
  ResolutionOption,
  StylePresetId,
  TaskMode
} from "@/lib/types";

interface WorkbenchShellProps {
  initialTasks: ImageTaskSummary[];
}

interface CachedWorkbenchState {
  mode: TaskMode;
  prompt: string;
  styleId: StylePresetId;
  resolution: ResolutionOption;
  enableOptimization: boolean;
  protocol: ImageProtocol;
  baseUrl: string;
  apiKey: string;
}

const WORKBENCH_CACHE_KEY = "image-generation-workbench:cache:v4";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const LEGACY_CACHE_KEYS = ["image-generation-workbench:cache:v3", "image-generation-workbench:cache:v2"];

const DEFAULT_CACHE_STATE: CachedWorkbenchState = {
  mode: "generate",
  prompt: "",
  styleId: "none",
  resolution: "1536x1024",
  enableOptimization: false,
  protocol: "images",
  baseUrl: DEFAULT_BASE_URL,
  apiKey: ""
};

function isTaskMode(value: unknown): value is TaskMode {
  return value === "generate" || value === "edit";
}

function isStylePresetId(value: unknown): value is StylePresetId {
  return (
    value === "none" ||
    value === "cinematic" ||
    value === "product" ||
    value === "anime" ||
    value === "editorial" ||
    value === "xiaomi-poster"
  );
}

function isResolutionOption(value: unknown): value is ResolutionOption {
  return value === "auto" || value === "1024x1024" || value === "1536x1024" || value === "1024x1536";
}

function isImageProtocol(value: unknown): value is ImageProtocol {
  return value === "images" || value === "responses";
}

function normalizeCachedState(raw: unknown): CachedWorkbenchState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_CACHE_STATE;
  }

  const candidate = raw as Partial<CachedWorkbenchState>;

  return {
    mode: isTaskMode(candidate.mode) ? candidate.mode : DEFAULT_CACHE_STATE.mode,
    prompt: typeof candidate.prompt === "string" ? candidate.prompt : DEFAULT_CACHE_STATE.prompt,
    styleId: isStylePresetId(candidate.styleId) ? candidate.styleId : DEFAULT_CACHE_STATE.styleId,
    resolution: isResolutionOption(candidate.resolution) ? candidate.resolution : DEFAULT_CACHE_STATE.resolution,
    enableOptimization:
      typeof candidate.enableOptimization === "boolean"
        ? candidate.enableOptimization
        : DEFAULT_CACHE_STATE.enableOptimization,
    protocol: isImageProtocol(candidate.protocol) ? candidate.protocol : DEFAULT_CACHE_STATE.protocol,
    baseUrl:
      typeof candidate.baseUrl === "string" && candidate.baseUrl.trim()
        ? candidate.baseUrl
        : DEFAULT_CACHE_STATE.baseUrl,
    apiKey: typeof candidate.apiKey === "string" ? candidate.apiKey : DEFAULT_CACHE_STATE.apiKey
  };
}

function shouldMigrateLegacyDefaults(candidate: CachedWorkbenchState) {
  return (
    candidate.mode === "generate" &&
    candidate.prompt === "" &&
    candidate.styleId === "cinematic" &&
    candidate.enableOptimization === true &&
    candidate.resolution === "1536x1024" &&
    candidate.protocol === "images"
  );
}

function readCachedWorkbenchState() {
  if (typeof window === "undefined") {
    return DEFAULT_CACHE_STATE;
  }

  try {
    const cached = window.localStorage.getItem(WORKBENCH_CACHE_KEY);
    if (cached) {
      return normalizeCachedState(JSON.parse(cached));
    }

    for (const legacyKey of LEGACY_CACHE_KEYS) {
      const legacyCached = window.localStorage.getItem(legacyKey);
      if (!legacyCached) {
        continue;
      }

      const migrated = normalizeCachedState(JSON.parse(legacyCached));
      window.localStorage.removeItem(legacyKey);

      if (shouldMigrateLegacyDefaults(migrated)) {
        return {
          ...migrated,
          styleId: DEFAULT_CACHE_STATE.styleId,
          enableOptimization: DEFAULT_CACHE_STATE.enableOptimization
        };
      }

      return migrated;
    }

    return DEFAULT_CACHE_STATE;
  } catch {
    window.localStorage.removeItem(WORKBENCH_CACHE_KEY);
    for (const legacyKey of LEGACY_CACHE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
    return DEFAULT_CACHE_STATE;
  }
}

export function WorkbenchShell({ initialTasks }: WorkbenchShellProps) {
  const [draft, setDraft] = useState<CachedWorkbenchState>(readCachedWorkbenchState);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [tasks, setTasks] = useState<ImageTaskSummary[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<ImageTaskSummary | null>(initialTasks[0] ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitStartedAt, setSubmitStartedAt] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState(0);

  const { apiKey, baseUrl, enableOptimization, mode, prompt, protocol, resolution, styleId } = draft;

  useEffect(() => {
    window.localStorage.setItem(WORKBENCH_CACHE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    if (!isSubmitting || !submitStartedAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setClockTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSubmitting, submitStartedAt]);

  const elapsedSeconds = useMemo(() => {
    if (!isSubmitting || !submitStartedAt) {
      return 0;
    }

    const now = clockTick || submitStartedAt;
    return Math.max(1, Math.floor((now - submitStartedAt) / 1000));
  }, [clockTick, isSubmitting, submitStartedAt]);

  const optimizedPreview = useMemo(() => {
    return buildOptimizedPrompt({
      mode,
      originalPrompt: prompt,
      styleId,
      resolution,
      enableOptimization
    }).optimizedPrompt;
  }, [enableOptimization, mode, prompt, resolution, styleId]);

  async function refreshTasks() {
    const response = await fetch("/api/tasks");
    if (!response.ok) return;

    const data = (await response.json()) as { tasks: ImageTaskSummary[] };
    setTasks(data.tasks);

    if (!activeTask && data.tasks[0]) {
      setActiveTask(data.tasks[0]);
    }
  }

  function updateDraft(patch: Partial<CachedWorkbenchState>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function upsertTask(task: ImageTaskSummary) {
    setActiveTask(task);
    setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
  }

  function clearLocalCache() {
    window.localStorage.removeItem(WORKBENCH_CACHE_KEY);
    for (const legacyKey of LEGACY_CACHE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
    setDraft(DEFAULT_CACHE_STATE);
    setSourceImage(null);
    setMaskImage(null);
    setErrorMessage("");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const startedAt = Date.now();
    setClockTick(startedAt);
    setSubmitStartedAt(startedAt);
    setErrorMessage("");

    try {
      if (mode === "generate") {
        const response = await fetch("/api/images/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt,
            styleId,
            resolution,
            enableOptimization,
            protocol,
            provider: {
              baseUrl,
              apiKey
            }
          })
        });

        const payload = (await response.json()) as { task?: ImageTaskSummary; error?: string };
        if (!response.ok) {
          if (payload.task) {
            upsertTask(payload.task);
          }
          throw new Error(payload.error || "生图失败。");
        }

        if (payload.task) {
          upsertTask(payload.task);
        }
      } else {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("styleId", styleId);
        formData.append("resolution", resolution);
        formData.append("enableOptimization", String(enableOptimization));
        formData.append("protocol", protocol);
        formData.append("baseUrl", baseUrl);
        formData.append("apiKey", apiKey);

        if (sourceImage) {
          formData.append("sourceImage", sourceImage);
        }
        if (maskImage) {
          formData.append("maskImage", maskImage);
        }

        const response = await fetch("/api/images/edit", {
          method: "POST",
          body: formData
        });

        const payload = (await response.json()) as { task?: ImageTaskSummary; error?: string };
        if (!response.ok) {
          if (payload.task) {
            upsertTask(payload.task);
          }
          throw new Error(payload.error || "编辑失败。");
        }

        if (payload.task) {
          upsertTask(payload.task);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setIsSubmitting(false);
      setClockTick(0);
      setSubmitStartedAt(null);
      void refreshTasks();
    }
  }

  return (
    <div className="shell shell--compact">
      <header className="hero hero--compact">
        <div className="hero__actions">
          <button
            className={`mode-chip ${mode === "generate" ? "active" : ""}`}
            onClick={() => updateDraft({ mode: "generate" })}
            type="button"
          >
            生图
          </button>
          <button
            className={`mode-chip ${mode === "edit" ? "active" : ""}`}
            onClick={() => updateDraft({ mode: "edit" })}
            type="button"
          >
            编辑
          </button>
        </div>
      </header>

      <main className="workspace-grid workspace-grid--compact">
        <aside className="workspace-grid__sidebar">
          <RuntimeConfigPanel
            apiKey={apiKey}
            baseUrl={baseUrl}
            onApiKeyChange={(value) => updateDraft({ apiKey: value })}
            onBaseUrlChange={(value) => updateDraft({ baseUrl: value })}
            onClearCache={clearLocalCache}
          />

          <section className="panel panel--compact">
            <div className="compact-select-grid">
              <ProtocolPicker onChange={(value) => updateDraft({ protocol: value })} value={protocol} />
              <StylePresetPanel onChange={(value) => updateDraft({ styleId: value })} value={styleId} />
              <ResolutionPicker onChange={(value) => updateDraft({ resolution: value })} value={resolution} />
            </div>
          </section>

          <PromptEditor
            enableOptimization={enableOptimization}
            onChange={(value) => updateDraft({ prompt: value })}
            onOptimizationChange={(value) => updateDraft({ enableOptimization: value })}
            optimizedPrompt={optimizedPreview}
            prompt={prompt}
          />

          {mode === "edit" ? (
            <ImageEditorUpload
              maskImageName={maskImage?.name ?? ""}
              onMaskImageChange={setMaskImage}
              onSourceImageChange={setSourceImage}
              sourceImageName={sourceImage?.name ?? ""}
            />
          ) : null}

          <button className="submit-button" disabled={isSubmitting} onClick={handleSubmit} type="button">
            {isSubmitting ? "处理中..." : mode === "generate" ? "开始生图" : "开始编辑"}
          </button>
        </aside>

        <section className="workspace-grid__main">
          <ResultStage
            activeTask={activeTask}
            elapsedSeconds={elapsedSeconds}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            mode={mode}
            protocol={protocol}
          />
        </section>

        <section className="workspace-grid__history">
          <div className="panel panel--compact">
            <div className="panel__header">
              <div>
                <p className="eyebrow">最近任务</p>
              </div>
            </div>
            <TaskList compact tasks={tasks.slice(0, 5)} />
          </div>
        </section>
      </main>
    </div>
  );
}
