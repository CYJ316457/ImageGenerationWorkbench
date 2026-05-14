import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { TASKS_DIR } from "@/lib/config";
import type { ImageTask } from "@/lib/types";

interface RepositoryOptions {
  baseDir?: string;
}

function sortTasks(tasks: ImageTask[]) {
  return [...tasks].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function createTaskRepository(options: RepositoryOptions = {}) {
  const baseDir = options.baseDir ?? TASKS_DIR;
  const tasksFile = path.join(baseDir, "tasks.json");

  async function ensureDir() {
    await mkdir(baseDir, { recursive: true });
  }

  async function readTasks(): Promise<ImageTask[]> {
    try {
      const raw = await readFile(tasksFile, "utf-8");
      const parsed = JSON.parse(raw) as ImageTask[];
      return sortTasks(parsed);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }

  async function writeTasks(tasks: ImageTask[]) {
    await ensureDir();
    await writeFile(tasksFile, `${JSON.stringify(sortTasks(tasks), null, 2)}\n`, "utf-8");
  }

  return {
    async list() {
      return readTasks();
    },
    async getById(taskId: string) {
      const tasks = await readTasks();
      return tasks.find((task) => task.id === taskId) ?? null;
    },
    async save(task: ImageTask) {
      const tasks = await readTasks();
      const nextTasks = tasks.filter((item) => item.id !== task.id);
      nextTasks.push(task);
      await writeTasks(nextTasks);
      return task;
    }
  };
}
