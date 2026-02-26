"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="py-16 bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/study-pilot-icon.png"
                alt="StudyPilot"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-foreground">
                StudyPilot
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              {t("description")}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("product")}</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link href="/library" className="hover:text-primary">
                  {t("links.library")}
                </Link>
              </li>
              <li className="hidden">
                <Link href="/pricing" className="hover:text-primary">
                  {t("links.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              {/* <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li> */}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("company")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary">
                  {t("links.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t("links.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            {t("copyright")}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary">
              {t("links.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              {t("links.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
