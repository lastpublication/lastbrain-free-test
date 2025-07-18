import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const ApiUrl = process.env.API_URL;
  const token = process.env.X_LASTBRAIN_TOKEN;
  const cookieHeader = req.headers.get("cookie");
  let userToken = "";

  if (cookieHeader) {
    const match = cookieHeader.match(/x-lastbrain-user-token=([^;]+)/);
    if (match) {
      userToken = match[1];
    }
  }

  if (!userToken || !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Utiliser fetch et await
  try {
    const response = await fetch(`${ApiUrl}/api/auth/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lastbrain-token": token,
      },
      body: JSON.stringify({ token: userToken }),
    });

    if (response.ok) {
      return NextResponse.next();
    } else {
      console.log("Authentication failed:", response.statusText);
      return NextResponse.redirect(new URL("/logout", req.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/logout", req.url));
  }
}

export const config = {
  matcher: ["/private", "/private/:path*"],
};
