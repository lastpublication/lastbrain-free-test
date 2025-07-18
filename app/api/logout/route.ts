export async function POST() {
  // Supprime le cookie en le réécrivant avec une date expirée
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie":
        "x-lastbrain-user-token=; HttpOnly; Path=/; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    },
  });
}
