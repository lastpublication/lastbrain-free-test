import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL;

  const { searchParams } = new URL(request.url);
  const code_product = searchParams.get("code_product");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  if (!token || !apiUrl) {
    return new Response(JSON.stringify({ error: "Missing token or API URL" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  try {
    let response;
    if (code_product) {
      // Récupération d'un produit par ID
      response = await axios.get(`${apiUrl}/api/product`, {
        params: {
          filter: `code_product=${code_product},status=active`,
          limit: 1,
        },
        headers: {
          "x-lastbrain-token": token,
          origin: request.headers.get("referer")
            ? new URL(request.headers.get("referer")!).origin
            : undefined,
        },
      });

      response = response.data[0] || null;
    } else {
      // Récupération paginée
      response = await axios.get(`${apiUrl}/api/product`, {
        params: { page, limit, filter: "status=active" },
        headers: {
          "x-lastbrain-token": token,
          origin: request.headers.get("referer")
            ? new URL(request.headers.get("referer")!).origin
            : undefined,
        },
      });
      response = response.data;
    }

    return NextResponse.json(
      { response },
      {
        status: 200,
      }
    );
  } catch (error: any) {
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
