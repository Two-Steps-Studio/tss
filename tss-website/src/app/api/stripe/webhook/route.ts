import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Błąd weryfikacji webhooka:", err);
    return NextResponse.json(
      { error: "Błąd weryfikacji webhooka" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const beatId = session.metadata?.beat_id;
    const tier = session.metadata?.tier;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (beatId && tier) {
      const supabase = await createClient();

      // Zaktualizuj status beatu
      await supabase
        .from("beats")
        .update({
          status: "sold",
          tier: tier,
          sold_at: new Date().toISOString(),
        })
        .eq("id", beatId);

      // Zapisz transakcję
      await supabase.from("beat_sales").insert({
        beat_id: beatId,
        stripe_session_id: session.id,
        amount: amount,
        tier: tier,
      });
    }
  }

  return NextResponse.json({ received: true });
}
