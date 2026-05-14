import { randomUUID } from "node:crypto";

import { buildOptimizedPrompt } from "@/lib/prompt/optimizer";
import { getStylePreset } from "@/lib/prompt/presets";
import { editImageFromPrompt, generateImageFromPrompt } from "@/lib/openai/images";
import { createAssetStorage } from "@/lib/storage/adapter";
import { createTaskRepository } from "@/lib/tasks/repository";
import { validateEditInput, validateGenerateInput } from "@/lib/validators/image-request";
import type {
  EditFormInput,
  GenerateFormInput,
  ImageTask,
  ImageTaskSummary,
  TaskMode
} from "@/lib/types";

class TaskServiceError extends Error {
  status: number;
  task: ImageTaskSummary | null;

  constructor(message: string, status: number, task: ImageTaskSummary | null = null) {
    super(message);
    this.name = "TaskServiceError";
    this.status = status;
    this.task = task;
  }
}

const repository = createTaskRepository();
const storage = createAssetStorage();

function toSummary(task: ImageTask): ImageTaskSummary {
  return {
    ...task,
    sourceImageUrl: storage.buildAssetUrl(task.sourceImageAssetId),
    maskImageUrl: storage.buildAssetUrl(task.maskImageAssetId),
    outputUrls: task.outputAssetIds.map((assetId) => storage.buildAssetUrl(assetId) ?? ""),
    styleLabel: getStylePreset(task.styleId).label
  };
}

async function persistTask(task: ImageTask) {
  await repository.save(task);
  return toSummary(task);
}

function buildBaseTask(
  mode: TaskMode,
  input: GenerateFormInput,
  optimizedPrompt: string
): ImageTask {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    mode,
    status: "running",
    originalPrompt: input.prompt,
    optimizedPrompt,
    styleId: input.styleId,
    resolution: input.resolution,
    createdAt: now,
    updatedAt: now,
    sourceImageAssetId: null,
    maskImageAssetId: null,
    outputAssetIds: [],
    errorMessage: null
  };
}

async function markFailed(task: ImageTask, message: string) {
  const failedTask: ImageTask = {
    ...task,
    status: "failed",
    errorMessage: message,
    updatedAt: new Date().toISOString()
  };

  return persistTask(failedTask);
}

export async function listTaskSummaries() {
  const tasks = await repository.list();
  return tasks.map(toSummary);
}

export async function getTaskSummary(taskId: string) {
  const task = await repository.getById(taskId);
  return task ? toSummary(task) : null;
}

export async function runGenerateTask(input: GenerateFormInput) {
  const validation = validateGenerateInput(input);
  if (!validation.ok) {
    throw new TaskServiceError(validation.error.message, 400);
  }

  const prompt = buildOptimizedPrompt({
    mode: "generate",
    originalPrompt: validation.data.prompt,
    styleId: validation.data.styleId,
    resolution: validation.data.resolution,
    enableOptimization: validation.data.enableOptimization
  });

  const baseTask = buildBaseTask("generate", validation.data, prompt.optimizedPrompt);
  await persistTask(baseTask);

  try {
    const result = await generateImageFromPrompt({
      prompt: prompt.optimizedPrompt,
      resolution: validation.data.resolution,
      provider: validation.data.provider
    });
    const outputAssetId = await storage.saveGeneratedImage(result.base64Data, result.contentType);
    const finishedTask: ImageTask = {
      ...baseTask,
      status: "succeeded",
      outputAssetIds: [outputAssetId],
      updatedAt: new Date().toISOString()
    };

    return persistTask(finishedTask);
  } catch (error) {
    const message = error instanceof Error ? error.message : "生图失败。";
    const failedTask = await markFailed(baseTask, message);
    throw new TaskServiceError(message, 502, failedTask);
  }
}

export async function runEditTask(input: EditFormInput) {
  const validation = validateEditInput(input);
  if (!validation.ok) {
    throw new TaskServiceError(validation.error.message, 400);
  }

  const sourceImage = validation.data.sourceImage;
  if (!sourceImage) {
    throw new TaskServiceError("编辑图片时必须上传原图。", 400);
  }

  const prompt = buildOptimizedPrompt({
    mode: "edit",
    originalPrompt: validation.data.prompt,
    styleId: validation.data.styleId,
    resolution: validation.data.resolution,
    enableOptimization: validation.data.enableOptimization
  });

  const baseTask = buildBaseTask("edit", validation.data, prompt.optimizedPrompt);
  const sourceImageAssetId = await storage.saveUploadedImage(sourceImage);
  const maskImageAssetId = validation.data.maskImage
    ? await storage.saveUploadedImage(validation.data.maskImage)
    : null;

  const runningTask: ImageTask = {
    ...baseTask,
    sourceImageAssetId,
    maskImageAssetId
  };
  await persistTask(runningTask);

  try {
    const result = await editImageFromPrompt({
      prompt: prompt.optimizedPrompt,
      resolution: validation.data.resolution,
      provider: validation.data.provider,
      sourceImage,
      maskImage: validation.data.maskImage
    });
    const outputAssetId = await storage.saveGeneratedImage(result.base64Data, result.contentType);
    const finishedTask: ImageTask = {
      ...runningTask,
      status: "succeeded",
      outputAssetIds: [outputAssetId],
      updatedAt: new Date().toISOString()
    };

    return persistTask(finishedTask);
  } catch (error) {
    const message = error instanceof Error ? error.message : "编辑图片失败。";
    const failedTask = await markFailed(runningTask, message);
    throw new TaskServiceError(message, 502, failedTask);
  }
}

export function toApiError(error: unknown) {
  if (error instanceof TaskServiceError) {
    return {
      status: error.status,
      body: {
        error: error.message,
        task: error.task
      }
    };
  }

  return {
    status: 500,
    body: {
      error: error instanceof Error ? error.message : "发生未知错误。"
    }
  };
}
