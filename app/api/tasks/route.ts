import { NextResponse } from "next/server";

import { listTaskSummaries } from "@/lib/tasks/service";

export async function GET() {
  const tasks = await listTaskSummaries();
  return NextResponse.json({ tasks });
}
