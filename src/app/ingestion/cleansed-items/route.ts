import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.SPRINGBOOT_BASE_URL;

const safeParse = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

type BackendItemResponse = {
  originalValue?: unknown;
  cleansedValue?: unknown;
  field?: string;
  label?: string;
  path?: string;
  [key: string]: unknown;
};

const normalizeItems = (payload: unknown): BackendItemResponse[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    if (Array.isArray((payload as Record<string, unknown>).items)) {
      return (payload as Record<string, unknown>).items as BackendItemResponse[];
    }
    if (Array.isArray((payload as Record<string, unknown>).records)) {
      return (payload as Record<string, unknown>).records as BackendItemResponse[];
    }
  }
  return [];
};

export async function GET(request: NextRequest) {
  if (!backendBaseUrl) {
    return NextResponse.json(
      { error: "SPRINGBOOT_BASE_URL is not configured." },
      { status: 500 },
    );
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing required `id` query parameter." },
      { status: 400 },
    );
  }

  try {
    const targetUrl = new URL(`/api/cleansed-items/${id}`, backendBaseUrl);
    const upstream = await fetch(targetUrl);
    const rawBody = await upstream.text();
    const body = safeParse(rawBody);
    const items = normalizeItems(body);

    return NextResponse.json(
      {
        upstreamStatus: upstream.status,
        upstreamOk: upstream.ok,
        items,
        rawBody,
      },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to reach Spring Boot backend.",
      },
      { status: 502 },
    );
  }
}
