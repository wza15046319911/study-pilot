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

const AUTH_RUNTIME_PREFIXES = [
  "/library",
  "/practice",
  "/profile",
  "/admin",
  "/homework",
  "/question-banks",
  "/weekly-practice",
  "/exams",
  "/subjects",
  "/calendar",
];

const AUTH_RUNTIME_EXACT_PATHS = ["/question-banks", "/subjects", "/calendar"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function ClientRuntimeEnhancers() {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  const shouldEnableAuthRuntime =
    AUTH_RUNTIME_EXACT_PATHS.includes(pathname) ||
    AUTH_RUNTIME_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));

  const shouldShowSupportButton =
    shouldEnableAuthRuntime &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/payment") &&
    !pathname.startsWith("/auth");

  if (!shouldEnableAuthRuntime && !shouldShowSupportButton) {
    return null;
  }

  return (
    <>
      {shouldEnableAuthRuntime ? (
        <>
          <SessionGuard />
          <AuthBootstrap />
        </>
      ) : null}
      {shouldShowSupportButton ? <FloatingSupportButton /> : null}
    </>
  );
}
