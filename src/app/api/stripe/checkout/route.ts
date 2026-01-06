import { NextRequest, NextResponse } from "next/server";
import { stripe, getCurrentPrice, isPromotionActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to make a purchase" },
        { status: 401 }
      );
    }

    // Check if user is already VIP
    const adminClient = createAdminClient();
    const { data: profileData } = await adminClient
      .from("profiles")
      .select("is_vip")
      .eq("id", user.id)
      .single();

    const profile = profileData as Pick<Profile, "is_vip"> | null;

    if (profile?.is_vip) {
      return NextResponse.json(
        { error: "You already have lifetime access!" },
        { status: 400 }
      );
    }

    // Get the current price
    const price = getCurrentPrice();
    const isPromo = isPromotionActive();

    // Get the origin for success/cancel URLs
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: "StudyPilot Lifetime Access",
              description: isPromo
                ? "🎉 Early Bird Special - Unlock ALL subjects forever!"
                : "Unlock ALL subjects forever!",
              images: [`${origin}/logo.png`],
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_type: "lifetime_access",
      },
    });

    // Create pending payment record
    await adminClient.from("payments").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount: price,
      currency: "aud",
      status: "pending",
      product_type: "lifetime_access",
    } as any);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
