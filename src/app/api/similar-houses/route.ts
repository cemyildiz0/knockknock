import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const modelUrl = process.env.MODEL_SERVER_URL;
  if (!modelUrl) {
    return NextResponse.json(
      { error: "MODEL_SERVER_URL is not configured" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Request must be multipart/form-data" },
      { status: 400 }
    );
  }

  const image = formData.get("image");
  if (!image || !(image instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing required field: image" },
      { status: 400 }
    );
  }

  const upstream = new FormData();
  upstream.append("image", image);

  const topK = formData.get("top_k");
  if (topK !== null) {
    upstream.append("top_k", String(topK));
  }

  let response: Response;
  try {
    response = await fetch(`${modelUrl}/predict`, {
      method: "POST",
      body: upstream,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not reach model server", detail: String(err) },
      { status: 502 }
    );
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
