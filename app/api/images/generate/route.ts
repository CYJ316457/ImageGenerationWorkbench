import { NextResponse } from "next/server";

import { runGenerateTask, toApiError } from "@/lib/tasks/service";
import type { GenerateFormInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GenerateFormInput;
    const task = await runGenerateTask(payload);
    return NextResponse.json({ task });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json(apiError.body, { status: apiError.status });
  }
}
