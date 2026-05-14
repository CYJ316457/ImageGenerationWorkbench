import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTaskRepository } from "@/lib/tasks/repository";
import type { ImageTask } from "@/lib/types";

describe("task repository", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "igw-repo-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("stores and sorts tasks by newest first", async () => {
    const repository = createTaskRepository({ baseDir: tempDir });
    const older: ImageTask = {
      id: "task-1",
      mode: "generate",
      status: "succeeded",
      originalPrompt: "旧任务",
      optimizedPrompt: "旧任务",
      styleId: "none",
      resolution: "1024x1024",
      createdAt: "2026-05-14T12:00:00.000Z",
      updatedAt: "2026-05-14T12:00:00.000Z",
      sourceImageAssetId: null,
      maskImageAssetId: null,
      outputAssetIds: [],
      errorMessage: null
    };
    const newer: ImageTask = {
      ...older,
      id: "task-2",
      originalPrompt: "新任务",
      optimizedPrompt: "新任务",
      createdAt: "2026-05-14T13:00:00.000Z",
      updatedAt: "2026-05-14T13:00:00.000Z"
    };

    await repository.save(older);
    await repository.save(newer);

    const tasks = await repository.list();

    expect(tasks[0]?.id).toBe("task-2");
    expect(tasks[1]?.id).toBe("task-1");
  });
});
