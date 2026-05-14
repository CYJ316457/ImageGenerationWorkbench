import Image from "next/image";
import Link from "next/link";

import type { ImageTaskSummary } from "@/lib/types";

interface TaskListProps {
  tasks: ImageTaskSummary[];
  compact?: boolean;
}

function statusLabel(status: ImageTaskSummary["status"]) {
  switch (status) {
    case "queued":
      return "排队中";
    case "running":
      return "生成中";
    case "succeeded":
      return "已完成";
    case "failed":
      return "失败";
    default:
      return status;
  }
}

export function TaskList({ tasks, compact = false }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state subtle">
        <p>还没有历史任务。</p>
        <p>先在工作台里发起一次生图或编辑任务，这里会自动出现记录。</p>
      </div>
    );
  }

  return (
    <div className={`task-list ${compact ? "compact" : ""}`}>
      {tasks.map((task) => {
        const outputUrl = task.outputUrls[0];
        return (
          <article className="task-card" key={task.id}>
            <div className="task-card__header">
              <div>
                <p className="eyebrow">{task.mode === "generate" ? "文本生图" : "图片编辑"}</p>
                <h3>{task.originalPrompt}</h3>
              </div>
              <span className={`status-chip status-chip--${task.status}`}>{statusLabel(task.status)}</span>
            </div>
            <p className="task-card__meta">
              {task.styleLabel} · {task.resolution === "auto" ? "自动分辨率" : task.resolution}
            </p>
            {outputUrl ? (
              <div className="task-card__preview">
                <Image alt={task.originalPrompt} height={720} src={outputUrl} unoptimized width={1152} />
              </div>
            ) : null}
            {task.errorMessage ? <p className="task-card__error">{task.errorMessage}</p> : null}
            <div className="task-card__footer">
              <time dateTime={task.createdAt}>{new Date(task.createdAt).toLocaleString("zh-CN")}</time>
              <Link href="/history">查看完整历史</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
