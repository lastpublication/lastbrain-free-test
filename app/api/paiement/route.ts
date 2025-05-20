import axios from "axios";
import { u } from "framer-motion/client";

export async function GET(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL;

  // Récupérer le paramètre amount depuis l'URL
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount") || "10"; // valeur par défaut 10

  const origin = request.headers.get("referer")
    ? new URL(request.headers.get("referer")!).origin
    : undefined;

  const url_success = `${origin}/panier`;
  const url_cancel = `${origin}/panier`;

  if (!token || !apiUrl) {
    return new Response(JSON.stringify({ error: "Missing token or API URL" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const response = await axios.post(
      `${apiUrl}/api/payment/create`,
      {
        amount,
        url_success: url_success,
        url_cancel: url_cancel,
      },
      {
        headers: {
          "x-lastbrain-token": token,
          origin: request.headers.get("referer")
            ? new URL(request.headers.get("referer")!).origin
            : undefined,
        },
      }
    );
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch data",
        details: error?.response?.data || error.message,
      }),
      {
        status: error?.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
