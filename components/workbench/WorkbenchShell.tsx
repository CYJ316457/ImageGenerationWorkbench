"use client";

import { useMemo, useState } from "react";

import { PromptEditor } from "@/components/workbench/PromptEditor";
import { ResolutionPicker } from "@/components/workbench/ResolutionPicker";
import { StylePresetPanel } from "@/components/workbench/StylePresetPanel";
import { ImageEditorUpload } from "@/components/workbench/ImageEditorUpload";
import { ResultStage } from "@/components/workbench/ResultStage";
import { TaskList } from "@/components/history/TaskList";
import { buildOptimizedPrompt } from "@/lib/prompt/optimizer";
import type { ImageTaskSummary, ResolutionOption, StylePresetId, TaskMode } from "@/lib/types";

interface WorkbenchShellProps {
  initialTasks: ImageTaskSummary[];
}

export function WorkbenchShell({ initialTasks }: WorkbenchShellProps) {
  const [mode, setMode] = useState<TaskMode>("generate");
  const [prompt, setPrompt] = useState("");
  const [styleId, setStyleId] = useState<StylePresetId>("cinematic");
  const [resolution, setResolution] = useState<ResolutionOption>("1536x1024");
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [tasks, setTasks] = useState<ImageTaskSummary[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<ImageTaskSummary | null>(initialTasks[0] ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  async function handleSubmit() {
    setIsSubmitting(true);
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
            enableOptimization
          })
        });

        const payload = (await response.json()) as { task?: ImageTaskSummary; error?: string };
        if (!response.ok) {
          if (payload.task) {
            setActiveTask(payload.task);
            setTasks((current) => [payload.task!, ...current.filter((item) => item.id !== payload.task!.id)]);
          }
          throw new Error(payload.error || "生图失败。");
        }

        if (payload.task) {
          setActiveTask(payload.task);
          setTasks((current) => [payload.task!, ...current.filter((item) => item.id !== payload.task!.id)]);
        }
      } else {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("styleId", styleId);
        formData.append("resolution", resolution);
        formData.append("enableOptimization", String(enableOptimization));
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
            setActiveTask(payload.task);
            setTasks((current) => [payload.task!, ...current.filter((item) => item.id !== payload.task!.id)]);
          }
          throw new Error(payload.error || "编辑失败。");
        }

        if (payload.task) {
          setActiveTask(payload.task);
          setTasks((current) => [payload.task!, ...current.filter((item) => item.id !== payload.task!.id)]);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setIsSubmitting(false);
      void refreshTasks();
    }
  }

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ImageGenerationWorkbench</p>
          <h1>部署到服务端的生图工作台</h1>
          <p className="hero__copy">
            面向 OpenAI 图片模型的网页工作台：文本生图、原图编辑、提示词优化、风格预设、分辨率选择和历史复用，全部集中在一个界面里。
          </p>
        </div>
        <div className="hero__actions">
          <button className={`mode-chip ${mode === "generate" ? "active" : ""}`} onClick={() => setMode("generate")} type="button">
            文本生图
          </button>
          <button className={`mode-chip ${mode === "edit" ? "active" : ""}`} onClick={() => setMode("edit")} type="button">
            编辑图片
          </button>
        </div>
      </header>

      <main className="workspace-grid">
        <aside className="workspace-grid__sidebar">
          <PromptEditor
            enableOptimization={enableOptimization}
            onChange={setPrompt}
            onOptimizationChange={setEnableOptimization}
            optimizedPrompt={optimizedPreview}
            prompt={prompt}
          />
          <StylePresetPanel onChange={setStyleId} value={styleId} />
          <ResolutionPicker onChange={setResolution} value={resolution} />
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
          <ResultStage activeTask={activeTask} errorMessage={errorMessage} isSubmitting={isSubmitting} />
        </section>

        <section className="workspace-grid__history">
          <div className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">最近任务</p>
                <h2>快速回看和复用</h2>
              </div>
            </div>
            <TaskList compact tasks={tasks.slice(0, 5)} />
          </div>
        </section>
      </main>
    </div>
  );
}
