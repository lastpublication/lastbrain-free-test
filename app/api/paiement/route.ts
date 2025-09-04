import axios from "axios";
import { cookies } from "next/headers";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Propal = {
  amount_ht?: number | null;
  amount_ttc?: number;
  created_at?: string | null;
  date_valid?: string;
  id?: string;
  note?: string | null;
  owner_id: string;
  ref?: string | null;
  status?: string | null;
  updated_at?: string | null;
  user_create: string;
};

type Propal_det = {
  attributs_grouped: Json | null;
  description: string | null;

  owner_id: string;
  price_ht: number;
  price_ttc: number;
  product_id: string | null;
  propal_id: string;
  quantity: number | null;
  rang: number;
  ref: string | null;
  tva_tx: number;
  user_create: string;
};

type Customer = {
  address: string | null;
  city: string | null;
  code_client: string | null;
  color: string | null;
  country: string | null;
  created_at: string;
  email: string | null;
  first_name: string | null;
  id?: string;
  import_id: string | null;
  industry: string | null;
  is_active: boolean | null;
  last_name: string | null;
  name: string | null;
  newsletter: boolean | null;
  note: string | null;
  owner_id: string;
  phone: string | null;
  siret: string | null;
  society: string | null;
  updated_at: string;
  user_create: string;
  vat_number: string | null;
  website: string | null;
  zip_code: string | null;
};

export async function GET(request: Request) {
  const token = process.env.X_LASTBRAIN_TOKEN;
  const apiUrl = process.env.API_URL;

  // Récupérer le paramètre amount depuis l'URL
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount") || "10"; // valeur par défaut 10
  const cart = searchParams.get("cart")
    ? JSON.parse(searchParams.get("cart")!)
    : [];
  const customer = JSON.parse(searchParams.get("customer")!);
  const note = searchParams.get("note") || "";
  const origin = request.headers.get("referer")
    ? new URL(request.headers.get("referer")!).origin
    : undefined;

  const url_success = `${origin}/panier?success=true`;
  const url_cancel = `${origin}/panier?cancel=true`;

  if (!token || !apiUrl) {
    return new Response(JSON.stringify({ error: "Missing token or API URL" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const store = await cookies(); // ⬅️ on attend la Promise

  // Récupération du cookie d'affiliation (posé par le SaaS lors du go/[code])
  const rawAff = store.get("lb_aff")?.value;
  let affiliate: any = null;
  if (rawAff) {
    try {
      const parsed = JSON.parse(rawAff);
      // Validation minimale et whitelisting des champs attendus
      affiliate = {
        owner_id: parsed?.owner_id ?? null,
        link_id: parsed?.link_id ?? null,
        product_id: parsed?.product_id ?? null,
        affiliate_product_id: parsed?.affiliate_product_id ?? null,
        at: parsed?.at ?? null,
        v: parsed?.v ?? 1,
      };
    } catch (_e) {
      affiliate = null;
    }
  }

  try {
    const response = await axios.post(
      `${apiUrl}/api/payment/create`,
      {
        amount,
        propal: { note },
        propal_det: cart.map((item: any, index: number) => ({
          attributs_grouped: item.attributs_grouped || null,
          description: item.description || null,
          owner_id: item.owner_id || "1",
          price_ht: item.price_ht || 0,
          price_ttc: item.price_ttc || 0,
          product_id: item.product_id || null,
          propal_id: item.propal_id || "",
          quantity: item.quantity || 1,
          rang: index + 1,
          ref: item.ref || null,
          tva_tx: item.tva_tx || 0,
          user_create: item.user_create || "1",
        })),
        affiliate,
        customer,
        url_success: url_success,
        url_cancel: url_cancel,
      },
      {
        headers: {
          "x-lastbrain-token": token,
          origin: request.headers.get("referer")
            ? new URL(request.headers.get("referer")!).origin
            : undefined,
        },
      }
    );
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
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
