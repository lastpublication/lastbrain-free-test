import { NextRequest } from "next/server";

const token = process.env.X_LASTBRAIN_TOKEN;
const apiUrl = process.env.API_URL;

export async function PUT(request: NextRequest) {
  try {
    const headers = new Headers();
    const x_lastbrain_user_token = request.cookies.get(
      "x-lastbrain-user-token"
    );
    headers.append("x-lastbrain-token", token || "");
    if (x_lastbrain_user_token) {
      headers.append(
        "x-lastbrain-user-token",
        x_lastbrain_user_token.value || ""
      );
    }
    const referer = request.headers.get("referer");
    if (referer) {
      headers.append("origin", new URL(referer).origin);
    }

    // Prépare le FormData à envoyer
    const formData = await request.formData();
    const file = formData.get("file");
    const formDataToSend = new FormData();
    if (!file) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    formDataToSend.append("file", file);

    const response = await fetch(`${apiUrl}/api/upload`, {
      method: "PUT",
      headers,
      body: formDataToSend,
    });

    if (!response.ok) {
      console.log("Upload failed with status:", response);
      const errorText = await response.text();
      throw new Error(errorText || "Upload failed");
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return new Response(JSON.stringify({ error: error.message || error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
