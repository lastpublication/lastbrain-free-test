import axios from "axios";

export async function GET(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL;

  // Récupérer les paramètres de pagination depuis l'URL
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  console.log(page, limit);
  if (!token || !apiUrl) {
    return new Response(JSON.stringify({ error: "Missing token or API URL" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const response = await axios.get(`${apiUrl}/api/product`, {
      params: { page, limit },
      headers: {
        "x-lastbrain-token": token,
        origin: request.headers.get("referer")
          ? new URL(request.headers.get("referer")!).origin
          : undefined,
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.log(error);
    // Récupère le message d'erreur personnalisé si présent
    const apiError =
      error?.response?.data?.details?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to fetch data";
    return new Response(
      JSON.stringify({
        error: apiError,
        details: error?.response?.data,
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
