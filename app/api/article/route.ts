import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
const token = process.env.X_LASTBRAIN_TOKEN;
const apiUrl = process.env.API_URL;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const categorySlug = params.get("categorySlug");
  if (!token) {
    return NextResponse.json({ error: "Token not set" }, { status: 401 });
  }
  if (categorySlug) {
    let response = await axios.get(
      `${apiUrl}/api/article/articleByCategory?categorySlug=${categorySlug}`,
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
      return new Response(JSON.stringify({ error: "Error fetching catalog" }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return NextResponse.json(
      { data: response.data.data, message: response.data.message },
      { status: 200 }
    );
  }
  let response = await axios.get(`${apiUrl}/api/article/category`, {
    headers: {
      "x-lastbrain-token": token,
      origin: request.headers.get("referer")
        ? new URL(request.headers.get("referer")!).origin
        : undefined,
    },
  });
  if (response.status !== 200) {
    return new Response(JSON.stringify({ error: "Error fetching article" }), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  console.log(response.data);
  return NextResponse.json({ data: response.data }, { status: 200 });
}
