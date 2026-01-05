import type { Metadata } from "next";
import { Lexend, Noto_Sans_SC, Fira_Code } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "@fontsource/maple-mono";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { FloatingSupportButton } from "@/components/common/FloatingSupportButton";

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

export const metadata: Metadata = {
  title: "StudyPilot - Smarter Practice for Midterms and Finals",
  description:
    "A pilot platform to help students practice smarter for midterms and finals. Built by students, tested in real courses.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>{/* Material Symbols removed */}</head>
      <body
        className={`${lexend.variable} ${notoSansSC.variable} ${firaCode.variable} font-sans antialiased bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white min-h-screen transition-colors duration-300`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
            <FloatingSupportButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
