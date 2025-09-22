import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
const token = process.env.X_LASTBRAIN_TOKEN;
const apiUrl = process.env.API_URL;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category_slug = params.get("category_slug");
  if (!token) {
    return NextResponse.json({ error: "Token not set" }, { status: 401 });
  }
  if (category_slug) {
    let response = await axios.get(
      `${apiUrl}/api/product/productByCategory?categorySlug=${category_slug}`,
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
      { data: response.data, message: response.data.message },
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

  return NextResponse.json({ data: response.data, status: 200 });
}
