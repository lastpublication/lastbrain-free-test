import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const token = process.env.X_LASTBRAIN_TOKEN;
const apiUrl = process.env.API_URL;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  }

  const relayForm = new FormData();
  relayForm.append("file", file);
  try {
    const response = await axios.post(`${apiUrl}/api/upload`, relayForm, {
      headers: {
        "x-lastbrain-token": token,
        "x-lastbrain-user-token": request.cookies.get("x-lastbrain-user-token")
          ?.value,
        origin: request.headers.get("referer")
          ? new URL(request.headers.get("referer")!).origin
          : undefined,
      },
    });

    return new Response(JSON.stringify(response.data), {
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
