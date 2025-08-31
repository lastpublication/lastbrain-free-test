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
    console.log(response.data.profile);

    return new Response(
      JSON.stringify({
        user: response.data.user,
        profile: response.data.profile,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `x-lastbrain-user-token=${response.data.lastbrain_user_token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Erreur lors de la connexion",
        details: error?.response?.data.message || "Une erreur est survenue",
      }),
      { status: 500 }
    );
  }
}
