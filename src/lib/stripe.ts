import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Proxy object for backwards compatibility - lazily initializes Stripe
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeServer() as any)[prop];
  },
});

// Product configuration
export const LIFETIME_ACCESS_PRICE = {
  // Prices in cents (AUD)
  earlyBird: 1990, // A$19.9
  regular: 4890, // A$48.9
  currency: "aud",
};

// Early bird promotion end date
export const PROMO_END_DATE = new Date("2026-02-06T23:59:59+11:00");

export function isPromotionActive(): boolean {
  return new Date() < PROMO_END_DATE;
}

export function getCurrentPrice(): number {
  return isPromotionActive()
    ? LIFETIME_ACCESS_PRICE.earlyBird
    : LIFETIME_ACCESS_PRICE.regular;
}
