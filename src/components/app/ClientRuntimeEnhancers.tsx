"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SessionGuard = dynamic(() => import("@/components/auth/SessionGuard"), {
  ssr: false,
});

const AuthBootstrap = dynamic(() => import("@/components/auth/AuthBootstrap"), {
  ssr: false,
});

const FloatingSupportButton = dynamic(
  () =>
    import("@/components/common/FloatingSupportButton").then(
      (module) => module.FloatingSupportButton
    ),
  { ssr: false }
);

export function ClientRuntimeEnhancers() {
  const pathname = usePathname();

  // Keep homepage lean: skip global client-only auth/support runtime on "/".
  if (!pathname || pathname === "/") {
    return null;
  }

  return (
    <>
      <SessionGuard />
      <AuthBootstrap />
      <FloatingSupportButton />
    </>
  );
}
