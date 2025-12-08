import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.SPRINGBOOT_BASE_URL;

const safeParse = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
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
    const targetUrl = new URL(`/api/enrichment/status/${id}`, backendBaseUrl);
    const upstream = await fetch(targetUrl);
    const rawBody = await upstream.text();
    const body = safeParse(rawBody);

    if (upstream.status === 404) {
      return NextResponse.json(
        {
          upstreamStatus: upstream.status,
          upstreamOk: false,
          body,
          rawBody,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        upstreamStatus: upstream.status,
        upstreamOk: upstream.ok,
        body,
        rawBody,
      },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reach Spring Boot enrichment status endpoint.",
      },
      { status: 502 },
    );
  }
}