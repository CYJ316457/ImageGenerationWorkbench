import { NextResponse } from "next/server";

import { createAssetStorage } from "@/lib/storage/adapter";

const storage = createAssetStorage();

interface AssetRouteContext {
  params: Promise<{
    assetId: string;
  }>;
}

export async function GET(_: Request, context: AssetRouteContext) {
  const { assetId } = await context.params;

  try {
    const asset = await storage.readAsset(assetId);
    return new NextResponse(new Uint8Array(asset.buffer), {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ error: "图片不存在。" }, { status: 404 });
  }
}
