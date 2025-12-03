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

  const sourceUri =
    typeof incoming === "object" && incoming !== null
      ? (incoming as Record<string, unknown>).sourceUri
      : undefined;

  if (typeof sourceUri !== "string" || !sourceUri.trim()) {
    return NextResponse.json(
      { error: "`sourceUri` must be a non-empty string." },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL(
    "/api/extract-cleanse-enrich-and-store",
    backendBaseUrl.endsWith("/") ? backendBaseUrl : `${backendBaseUrl}/`,
  );
  upstreamUrl.searchParams.set("sourceUri", sourceUri.trim());

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
    });
    const rawBody = await upstream.text();
    const body = safeParse(rawBody);

    return NextResponse.json(
      {
        upstreamStatus: upstream.status,
        upstreamOk: upstream.ok,
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
