import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL || "";

  // Normalize URL join to avoid missing or double slashes
  const base = apiUrl.endsWith("/") ? apiUrl : apiUrl + "/";
  const endpoint = base + "api/auth/customer/signup";

  try {
    const {
      email,
      password,
      captchaToken,
      customer: incomingCustomer,
    } = await request.json();

    // Build customer payload: prefer explicit `customer` object but merge email/password
    const customer = { ...(incomingCustomer ?? {}) } as Record<string, any>;
    if (email) customer.email = email;
    if (password) customer.password = password;
    // Return the promise chain so the route returns the NextResponse produced in .then or .catch
    return axios
      .post(
        endpoint,
        {
          email,
          password,
          customer,
          captchaToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-lastbrain-token": token ?? "",
          },
        }
      )
      .then((response) => {
        const { user, profile, lastbrain_user_token } = response.data || {};

        const res = NextResponse.json({ user, profile }, { status: 200 });

        // In dev over http://localhost, do NOT mark cookie as Secure, otherwise it won't be stored by the browser
        const isProd = process.env.NODE_ENV === "production";

        res.cookies.set({
          name: "x-lastbrain-user-token",
          value: String(lastbrain_user_token || ""),
          httpOnly: true,
          sameSite: "lax",
          secure: isProd,
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });

        return res;
      })
      .catch((err: any) => {
        // If this is an Axios error, prefer sending the upstream response body back to the client
        if (axios.isAxiosError(err)) {
          const status = err.response?.status || 500;
          const payload = err.response?.data ?? { message: err.message };

          console.error("Axios error response:", {
            status: err.response?.status,
            data: err.response?.data,
            headers: err.response?.headers,
          });

          return NextResponse.json(
            {
              error: "Erreur lors de la création",
              details: payload,
            },
            { status }
          );
        }

        return NextResponse.json(
          {
            error: "Erreur lors de la création",
            details: err?.message || "Une erreur est survenue",
          },
          { status: 500 }
        );
      });
  } catch (err: any) {
    // Improve error visibility for debugging and return the upstream payload when possible
    console.error("Auth POST error:", err?.message || err);

    // If this is an Axios error, prefer sending the upstream response body back to the client
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const payload = err.response?.data ?? { message: err.message };

      // Log the important bits
      console.error("Axios error response:", {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });

      return NextResponse.json(
        {
          error: "Erreur lors de la connexion",
          details: payload,
        },
        { status }
      );
    }

    // Fallback for non-Axios errors
    return NextResponse.json(
      {
        error: "Erreur lors de la création",
        details: err?.message || "Une erreur est survenue",
      },
      { status: 500 }
    );
  }
}
