"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const WeChatPaymentModal = dynamic(
  () =>
    import("./WeChatPaymentModal").then((module) => module.WeChatPaymentModal),
  {
    ssr: false,
  },
);

interface CheckoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({ className, children }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCheckout = async () => {
    // Temporary: Show WeChat modal instead of Stripe
    setShowModal(true);
    
    /* 
    // Stripe implementation commented out for now
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push("/login?redirect=/pricing");
          return;
        }
        throw new Error(data.error || "Something went wrong");
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setIsLoading(false);
    }
    */
  };

  return (
    <>
      <div className="w-full">
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={className}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Processing...
            </span>
          ) : (
            children || "Buy Now"
          )}
        </button>
        {error && (
          <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
        )}
      </div>

      <WeChatPaymentModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
