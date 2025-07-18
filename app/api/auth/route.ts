import axios from "axios";
import { get } from "http";

export async function POST(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL;

  try {
    const { email, password } = await request.json();
    const response = await axios.post(
      `${apiUrl}api/auth/customer`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          "x-lastbrain-token": token,
        },
      }
    );

    return new Response(JSON.stringify(response.data.user), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `x-lastbrain-user-token=${response.data.token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
      },
    });
  } catch (error: any) {
    console.log("Error during authentication:", error?.response?.data.message);
    return new Response(
      JSON.stringify({
        error: "Erreur lors de la connexion",
        details: error?.response?.data.message || "Une erreur est survenue",
      }),
      { status: 500 }
    );
  }
}
