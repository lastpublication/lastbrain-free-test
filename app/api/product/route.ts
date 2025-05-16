import axios from "axios";

export async function GET(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  console.log("X_LASTBRAIN_TOKEN:", token);
  const apiUrl = process.env.API_URL;

  if (!token || !apiUrl) {
    return new Response(JSON.stringify({ error: "Missing token or API URL" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const response = await axios.get(`${apiUrl}/api/product/list`, {
      headers: {
        "x-lastbrain-token": token,
        origin: request.headers.get("origin") || "*",
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error(error);

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
