import axios from "axios";

export async function GET(request: Request) {
  try {
    const token = process.env.X_LASTBRAIN_TOKEN;
    const apiUrl = process.env.API_URL;

    const response = await axios.get(`${apiUrl}api/settings-domain`, {
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
    return new Response(
      JSON.stringify({
        error: "Erreur lors de l'appel à l'API externe",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
