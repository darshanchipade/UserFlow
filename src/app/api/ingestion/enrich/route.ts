import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.SPRINGBOOT_BASE_URL;

const safeParse = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

export async function POST(request: NextRequest) {
  if (!backendBaseUrl) {
    return NextResponse.json(
      { error: "SPRINGBOOT_BASE_URL is not configured." },
      { status: 500 },
    );
  }

  let incoming: unknown;
  try {
    incoming = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const id =
    typeof incoming === "object" && incoming !== null
      ? ((incoming as Record<string, unknown>).id as string | undefined)
      : undefined;

  if (!id) {
    return NextResponse.json(
      { error: "Missing `id` in request body." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `${backendBaseUrl}/api/start-enrichment/${encodeURIComponent(id)}`,
      {
        method: "POST",
      },
    );

    const rawBody = await upstream.text();
    const body = safeParse(rawBody);
    const statusValue =
      typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).status === "string"
        ? ((body as Record<string, unknown>).status as string)
        : typeof rawBody === "string"
          ? rawBody
          : null;

    return NextResponse.json(
      {
        upstreamStatus: upstream.status,
        upstreamOk: upstream.ok,
        status: statusValue,
        body,
        rawBody,
      },
      { status: upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reach Spring Boot backend.",
      },
      { status: 502 },
    );
  }
}
