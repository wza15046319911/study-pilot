import type { Metadata } from "next";
import { Lexend, Noto_Sans_SC, Fira_Code } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "@fontsource/maple-mono";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { FloatingSupportButton } from "@/components/common/FloatingSupportButton";
import SessionGuard from "@/components/auth/SessionGuard";
import AuthBootstrap from "@/components/auth/AuthBootstrap";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/seo/JsonLd";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studypilot.com";

export const metadata: Metadata = {
  // Title Configuration
  title: {
    default: "StudyPilot - Exam Practice Platform",
    template: "%s | StudyPilot",
  },

  // Core SEO
  description:
    "Master your exams with curated question banks, spaced repetition flashcards, and smart mistake tracking. Practice smarter for midterms and finals with 10,000+ curated questions.",
  keywords: [
    "exam practice",
    "question bank",
    "flashcards",
    "spaced repetition",
    "study app",
    "university exam prep",
    "midterm practice",
    "finals preparation",
    "CSSE1001",
    "CSSE7030",
    "COMP3506",
    "INFS3202",
    "INFS7202",
    "COMP7505",
    "UQ",
  ],

  // Authorship
  authors: [{ name: "StudyPilot Team" }],
  creator: "StudyPilot",
  publisher: "StudyPilot",

  // Base URL for relative URLs
  metadataBase: new URL(siteUrl),

  // Alternates for i18n
  alternates: {
    canonical: "/",
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_AU",
    alternateLocale: ["zh_CN"],
    url: siteUrl,
    siteName: "StudyPilot",
    title: "StudyPilot - Exam Practice Platform",
    description:
      "Master your exams with curated question banks and smart learning. Join thousands of students studying smarter.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StudyPilot - AI-Powered Exam Practice Platform",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "StudyPilot - Exam Practice",
    description:
      "Master your exams with curated question banks and smart learning.",
    images: ["/og-image.png"],
    creator: "@studypilot",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // App Info
  applicationName: "StudyPilot",
  category: "Education",

  // Search Console Verification
  verification: {
    google: "C7ASyq2mQ5IecTQXJ5eYx_Ll9M4Leu2GlFw7J4ln77A",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <head>
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body
        className={`${lexend.variable} ${notoSansSC.variable} ${firaCode.variable} font-sans antialiased bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white min-h-screen transition-colors duration-300`}
        style={{ overscrollBehavior: "contain" }}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <SessionGuard />
            <AuthBootstrap />
            {children}
            <FloatingSupportButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
