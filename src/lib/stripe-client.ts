import { loadStripe } from "@stripe/stripe-js";

// Singleton pattern for Stripe client
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error(
        "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable"
      );
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
