import { cookies } from "next/headers";

export async function readAffiliateCookie() {
  const store = await cookies(); // ⬅️ on attend la Promise
  const c = store.get("lb_aff")?.value;
  if (!c) return null;
  try {
    return JSON.parse(c);
  } catch {
    return null;
  }
}
