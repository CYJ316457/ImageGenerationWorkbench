import { WorkbenchShell } from "@/components/workbench/WorkbenchShell";
import { listTaskSummaries } from "@/lib/tasks/service";

export default async function HomePage() {
  const tasks = await listTaskSummaries();
  return <WorkbenchShell initialTasks={tasks} />;
}
