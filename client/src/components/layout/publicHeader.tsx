import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useEffect, useState } from "react";
import { TokenManager } from "@/lib/auth";
import MetaPixel from "@/components/analytics/MetaPixel";
import { useTheme } from "@/hooks/use-theme";

const PublicHeader = () => {
  const { isRTL, t } = useLanguage();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authorizeUser, setAuthorizeUser] = useState(false);

  useEffect(() => {
    if (TokenManager.getAccessToken()) {
      setAuthorizeUser(true);
    }
  }, []);

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className="sticky
     top-0 z-50 w-full border-b bg-background/95 
     bg-white
     backdrop-blur bg-white  supports-[backdrop-filter]:bg-background/60">
      <MetaPixel />
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              className="flex items-center space-x-2"
              onClick={() => (location.href = "/")}>
              <img
                src={theme === "dark" ? "/white.png" : "/logo.png"}
                alt="Logo"
                className=" h-8 sm:w-[100px] sm:h-10"
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
              {t("landing", "navigation.features")}
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors">
              {t("landing", "navigation.howItWorks")}
            </a>
            <a
              href="/#pricing"
              className="text-sm font-medium hover:text-primary transition-colors">
              {t("landing", "navigation.pricing")}
            </a>
            <Link href="/blog">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("landing", "navigation.blog")}
              </span>
            </Link>
            <Link href="/faq">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "faq")}
              </span>
            </Link>
            <Link href="/privacy-terms">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "privacyTerms")}
              </span>
            </Link>
            <Link href="/contact">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "contact")}
              </span>
            </Link>
            <Link href="/feed">
              <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                {t("sidebar", "adsFeed")}
              </span>
            </Link>
          </div>

          {/* Desktop Actions */}
          {authorizeUser ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/dashboard" className="mx-2">
                <div className="hidden md:flex items-center space-x-2">
                  <Button size="sm">{t("auth", "dashboard")}</Button>
                </div>
              </Link>
              <div className="mx-2">
                <ThemeToggle />
              </div>
              <div className="mx-2">
                <LanguageToggle />
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("auth", "signInTitle")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">{t("auth", "signUpTitle")}</Button>
              </Link>
            </div>
          )}

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
              ? "max-h-99 opacity-100 border-t"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <div className="py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <a
                href="/#features"
                className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                {t("landing", "navigation.features")}
              </a>
              <a
                href="/#how-it-works"
                className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                {t("landing", "navigation.howItWorks")}
              </a>
              <a
                href="/#pricing"
                className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                {t("landing", "navigation.pricing")}
              </a>
              <Link href="/blog">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("landing", "navigation.blog")}
                </span>
              </Link>
              <Link href="/faq">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "faq")}
                </span>
              </Link>
              <Link href="/privacy-terms">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "privacyTerms")}
                </span>
              </Link>
              <Link href="/contact">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "contact")}
                </span>
              </Link>
              <Link href="/feed">
                <span
                  className="block px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("sidebar", "adsFeed")}
                </span>
              </Link>
            </div>

            {/* Mobile Auth Buttons */}

            {authorizeUser ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {t("auth", "dashboard")}
                </Button>
              </Link>
            ) : (
              // </div>
              <div className="px-4 pt-4 border-t space-y-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    {t("auth", "signInTitle")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    {t("auth", "signUpTitle")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;
