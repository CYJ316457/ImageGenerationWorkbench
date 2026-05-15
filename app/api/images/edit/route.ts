import { NextResponse } from "next/server";

import { runEditTask, toApiError } from "@/lib/tasks/service";
import type { EditFormInput, UploadedImageInput } from "@/lib/types";

async function readOptionalFile(file: FormDataEntryValue | null): Promise<UploadedImageInput | null> {
  if (!(file instanceof File)) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    name: file.name,
    contentType: file.type,
    size: file.size,
    buffer
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload: EditFormInput = {
      prompt: String(formData.get("prompt") || ""),
      styleId: String(formData.get("styleId") || "none") as EditFormInput["styleId"],
      resolution: String(formData.get("resolution") || "auto") as EditFormInput["resolution"],
      enableOptimization: String(formData.get("enableOptimization") || "true") === "true",
      protocol: String(formData.get("protocol") || "images") as EditFormInput["protocol"],
      provider: {
        baseUrl: String(formData.get("baseUrl") || ""),
        apiKey: String(formData.get("apiKey") || "")
      },
      sourceImage: await readOptionalFile(formData.get("sourceImage")),
      maskImage: await readOptionalFile(formData.get("maskImage"))
    };

    const task = await runEditTask(payload);
    return NextResponse.json({ task });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json(apiError.body, { status: apiError.status });
  }
}
