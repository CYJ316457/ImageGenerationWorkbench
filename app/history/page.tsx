import Link from "next/link";

import { TaskList } from "@/components/history/TaskList";
import { listTaskSummaries } from "@/lib/tasks/service";

export default async function HistoryPage() {
  const tasks = await listTaskSummaries();

  return (
    <main className="history-page">
      <header className="history-page__header">
        <div>
          <p className="eyebrow">任务历史</p>
          <h1>查看所有生成与编辑记录</h1>
        </div>
        <Link className="primary-link" href="/">
          返回工作台
        </Link>
      </header>
      <TaskList tasks={tasks} />
    </main>
  );
}
