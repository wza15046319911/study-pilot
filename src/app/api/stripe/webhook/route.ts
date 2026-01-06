import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

// Disable body parsing, we need raw body for webhook verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutComplete(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const productType = session.metadata?.product_type;

  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  console.log(`Processing payment for user ${userId}, product: ${productType}`);

  const supabase = createAdminClient();

  try {
    // Update payment record
    const paymentUpdate = {
      status: "completed",
      stripe_payment_intent: session.payment_intent as string,
      completed_at: new Date().toISOString(),
    };
    await (supabase.from("payments") as any)
      .update(paymentUpdate)
      .eq("stripe_session_id", session.id);

    // Update user's VIP status
    if (productType === "lifetime_access") {
      const vipUpdate = {
        is_vip: true,
        vip_expires_at: null, // Lifetime access, never expires
      };
      const { error: updateError } = await (supabase.from("profiles") as any)
        .update(vipUpdate)
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating VIP status:", updateError);
        throw updateError;
      }

      console.log(`Successfully upgraded user ${userId} to VIP`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    throw error;
  }
}
