import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
const token = process.env.X_LASTBRAIN_TOKEN;
const apiUrl = process.env.API_URL;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const slug = params.get("slug");
  if (!token) {
    return NextResponse.json({ error: "Token not set" }, { status: 401 });
  }

  if (slug) {
    try {
      const response = await axios.get(
        `${apiUrl}/api/article?slug=${encodeURIComponent(slug)}`,
        {
          headers: {
            "x-lastbrain-token": token,
            origin: request.headers.get("referer")
              ? new URL(request.headers.get("referer")!).origin
              : undefined,
          },
        }
      );

      if (response.status !== 200) {
        return new Response(
          JSON.stringify({ error: "Error fetching article" }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (err: any) {
      const status = err?.response?.status || 500;
      const message = err?.response?.data || { error: err.message };
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}
