import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL || "";

  // Normalize URL join to avoid missing or double slashes
  const base = apiUrl.endsWith("/") ? apiUrl : apiUrl + "/";
  const endpoint = base + "api/auth/customer";

  try {
    const { email, password } = await request.json();

    const response = await axios.post(
      endpoint,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          "x-lastbrain-token": token ?? "",
        },
      }
    );

    const { user, profile, lastbrain_user_token } = response.data || {};

    // Build a NextResponse to set cookie reliably
    const res = NextResponse.json({ user, profile }, { status: 200 });

    // In dev over http://localhost, do NOT mark cookie as Secure, otherwise it won't be stored by the browser
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set({
      name: "x-lastbrain-user-token",
      value: String(lastbrain_user_token || ""),
      httpOnly: true,
      sameSite: "lax",
      secure: isProd, // only secure on prod/https
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || "Une erreur est survenue";

    // If bad credentials, surface 401 for the client to handle
    return NextResponse.json(
      {
        error: "Erreur lors de la connexion",
        details: message,
      },
      { status }
    );
  }
}
