import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useState } from "react";

const PublicHeader = () => {
  const { language, isRTL, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              className="flex items-center space-x-2"
              onClick={() => (location.href = "/")}>
              <img
                src="/logo.webp"
                alt="Logo"
                className="w-20 h-8 sm:w-[100px] sm:h-10"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div
            className={`hidden lg:flex items-center space-x-6 ${
              isRTL ? "space-x-reverse" : ""
            }`}>
            <a
              href="/#features"
              className="text-sm font-medium hover:text-primary transition-colors">
              {t("landing", "navigation.features" as any)}
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors">
              {t("landing", "navigation.howItWorks" as any)}
            </a>
            <a
              href="/#pricing"
              className="text-sm font-medium hover:text-primary transition-colors">
              {t("landing", "navigation.pricing" as any)}
            </a>
            <Link href="/faq">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "faq" as any)}
              </span>
            </Link>
            <Link href="/privacy-terms">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "privacyTerms" as any)}
              </span>
            </Link>
            <Link href="/contact">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "contact" as any)}
              </span>
            </Link>
            <Link href="/feed">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "adsFeed" as any)}
              </span>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("auth", "signInTitle" as any)}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{t("auth", "signUpTitle" as any)}</Button>
            </Link>
          </div>

          {/* Mobile Actions - Theme/Language toggles + Menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label="Toggle menu">
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-1"
                      : "-translate-y-0.5"
                  }`}
                />
                <span
                  className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-1"
                      : "translate-y-0.5"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 border-t"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <div className="py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <a
                href="/#features"
                className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                {t("landing", "navigation.features" as any)}
              </a>
              <a
                href="/#how-it-works"
                className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                {t("landing", "navigation.howItWorks" as any)}
              </a>
              <a
                href="/#pricing"
                className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                {t("landing", "navigation.pricing" as any)}
              </a>
              <Link href="/faq">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "faq" as any)}
                </span>
              </Link>
              <Link href="/privacy-terms">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "privacyTerms" as any)}
                </span>
              </Link>
              <Link href="/contact">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "contact" as any)}
                </span>
              </Link>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="px-4 pt-4 border-t space-y-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("auth", "signInTitle" as any)}
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("auth", "signUpTitle" as any)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;
