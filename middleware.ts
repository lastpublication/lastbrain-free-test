import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "lb_aff";
const DEFAULT_COOKIE_DAYS = 30;

/** =========================
 * Helpers (Option A - token signé "aff")
 * ========================= */
function b64urlToUint8Array(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  const base64 = s + "=".repeat(pad);
  const raw = Buffer.from(base64, "base64");
  return new Uint8Array(raw);
}

async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

async function tryHandleAffToken(
  req: NextRequest
): Promise<NextResponse | null> {
  const aff = req.nextUrl.searchParams.get("aff");
  const secret = process.env.AFF_SIGNING_SECRET;
  if (!aff || !secret) return null;

  try {
    const [p64, sig] = aff.split(".");
    if (!p64 || !sig) throw new Error("bad token");

    const payloadJson = Buffer.from(b64urlToUint8Array(p64)).toString("utf8");
    const expected = await hmacSha256(secret, p64);
    if (sig !== expected) throw new Error("bad signature");

    const payload = JSON.parse(payloadJson) as {
      owner_id: string;
      product_id: string | null;
      affiliate_product_id: string | null;
      link_id?: string | null;
      at: number;
      v: number;
      cookie_days?: number;
    };

    const cookieDays =
      typeof payload.cookie_days === "number" &&
      Number.isFinite(payload.cookie_days)
        ? payload.cookie_days
        : DEFAULT_COOKIE_DAYS;

    // Redirige vers la même URL sans ?aff
    const clean = new URL(req.nextUrl.toString());
    clean.searchParams.delete("aff");

    const res = NextResponse.redirect(clean, { status: 302 });
    res.cookies.set({
      name: COOKIE_NAME,
      value: JSON.stringify({
        owner_id: payload.owner_id,
        link_id: payload.link_id ?? null,
        product_id: payload.product_id,
        affiliate_product_id: payload.affiliate_product_id,
        at: payload.at,
        v: payload.v,
      }),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: cookieDays * 24 * 60 * 60,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    // Token invalide → on ignore sans bloquer la navigation
    return null;
  }
}

/** =========================
 * Option B - resolve via API Lastbrain
 * ========================= */
async function tryHandleCodeResolve(
  req: NextRequest
): Promise<NextResponse | null> {
  const code = req.nextUrl.searchParams.get("code");
  const API_URL = process.env.API_URL;
  const X_TOKEN = process.env.X_LASTBRAIN_TOKEN;
  if (!code || !API_URL || !X_TOKEN) return null;

  try {
    const r = await fetch(
      `${API_URL}/api/affiliate/resolve?code=${encodeURIComponent(code)}`,
      {
        method: "GET",
        headers: {
          "x-lastbrain-token": X_TOKEN,
        },
        cache: "no-store",
      }
    );

    if (!r.ok) return null;

    const { payload, redirectPath, cookieDays } = await r.json();

    const maxAge = Number.isFinite(cookieDays)
      ? cookieDays * 24 * 60 * 60
      : DEFAULT_COOKIE_DAYS * 24 * 60 * 60;

    const absolute = /^https?:\/\//i.test(redirectPath)
      ? redirectPath
      : new URL(redirectPath, req.nextUrl.origin).toString();

    const res = NextResponse.redirect(absolute, { status: 302 });
    res.cookies.set({
      name: COOKIE_NAME,
      value: JSON.stringify(payload),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return null;
  }
}

/** =========================
 * Auth guard /private (ton code)
 * ========================= */
async function guardPrivate(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;
  if (!pathname.startsWith("/private")) return null; // ne garde que /private

  const API_URL = process.env.API_URL;
  const X_TOKEN = process.env.X_LASTBRAIN_TOKEN;

  // Use Next.js cookie helper to read the cookie reliably
  const userToken = req.cookies.get("x-lastbrain-user-token")?.value || "";

  // If no user token, send to login
  if (!userToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If backend config is missing (e.g., in local dev), allow access instead of forcing logout
  if (!API_URL || !X_TOKEN) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[MW] Skipping /private auth check: missing API_URL or X_LASTBRAIN_TOKEN"
      );
      return null;
    }
    // In production, fail closed
    return NextResponse.redirect(new URL("/logout", req.url));
  }

  try {
    const resp = await fetch(`${API_URL}/api/auth/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lastbrain-token": X_TOKEN,
      },
      body: JSON.stringify({ token: userToken }),
      cache: "no-store",
    });
    console.log(resp);
    // OK -> let the request pass
    if (resp.ok) return null;

    // 401/403 -> not authenticated, redirect to login (not logout to avoid clearing local state prematurely)
    if (resp.status === 401 || resp.status === 403) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Other server errors -> let it pass (fail-open) in dev to avoid UX loop, strict in prod
    if (process.env.NODE_ENV !== "production") {
      console.warn("[MW] /private auth check failed with status", resp.status);
      return null;
    }

    return NextResponse.redirect(new URL("/logout", req.url));
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[MW] /private auth check network error", e);
      return null;
    }
    return NextResponse.redirect(new URL("/logout", req.url));
  }
}

/** =========================
 * Middleware principal
 * ========================= */
export async function middleware(req: NextRequest) {
  // 1) Affiliation par token signé ?aff=...
  const viaAff = await tryHandleAffToken(req);
  if (viaAff) return viaAff;

  // 2) Affiliation par code ?code=... (résolution via API Lastbrain)
  const viaCode = await tryHandleCodeResolve(req);
  if (viaCode) return viaCode;

  // 3) Guard /private
  const guard = await guardPrivate(req);
  if (guard) return guard;

  return NextResponse.next();
}

/**
 * On applique le middleware à toutes les pages (pour capter ?aff / ?code),
 * en excluant les assets statiques.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
