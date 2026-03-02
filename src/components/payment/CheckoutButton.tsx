"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

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
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="w-full">
        <button onClick={() => setShowModal(true)} className={className}>
          {children || "Buy Now"}
        </button>
      </div>

      <WeChatPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
