import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.SPRINGBOOT_BASE_URL;

const safeParse = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

const fetchStatus = async (id: string) => {
  const shouldUseQuery = true;
  const targetBase = new URL("/api/enrichment/status", backendBaseUrl);

  const attempt = async (useQuery: boolean) => {
    const target = new URL(targetBase.toString());
    if (useQuery) {
      target.searchParams.set("id", id);
    } else {
      target.pathname = `${target.pathname.endsWith("/") ? target.pathname.slice(0, -1) : target.pathname}/${id}`;
    }
    const upstream = await fetch(target);
    return { upstream, usedQuery: useQuery };
  };

  let { upstream, usedQuery } = await attempt(shouldUseQuery);

  if (
    !upstream.ok &&
    upstream.status === 404 &&
    usedQuery
  ) {
    const fallback = await attempt(false);
    upstream = fallback.upstream;
    usedQuery = fallback.usedQuery;
  }

  return upstream;
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
    const upstream = await fetchStatus(id);
    const rawBody = await upstream.text();
    const body = safeParse(rawBody);

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
