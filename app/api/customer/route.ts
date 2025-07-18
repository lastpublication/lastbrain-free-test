import axios from "axios";
import { NextRequest } from "next/server";
const token = process.env.X_LASTBRAIN_TOKEN;
const apiUrl = process.env.API_URL;

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(`${apiUrl}/api/customer/customer`, {
      headers: {
        "x-lastbrain-token": token,
        "x-lastbrain-user-token": request.cookies.get("x-lastbrain-user-token")
          ?.value,
        origin: request.headers.get("referer")
          ? new URL(request.headers.get("referer")!).origin
          : undefined,
      },
    });

    return new Response(JSON.stringify(response.data.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error?.response?.data.message || "Action non autorisée",
        details: error?.response?.data,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  try {
    const response = await axios.put(`${apiUrl}/api/customer/customer`, body, {
      headers: {
        "x-lastbrain-token": token,
        "x-lastbrain-user-token": request.cookies.get("x-lastbrain-user-token")
          ?.value,
        origin: request.headers.get("referer")
          ? new URL(request.headers.get("referer")!).origin
          : undefined,
      },
    });

    return new Response(JSON.stringify(response.data.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error?.response?.data.message || "Action non autorisée",
        details: error?.response?.data,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}
