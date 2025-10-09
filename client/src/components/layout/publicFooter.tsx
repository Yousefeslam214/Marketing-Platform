import { useLanguage } from "@/hooks/use-language";
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const PublicFooter = () => {
  const { isRTL, t } = useLanguage();
  return (
    <footer
      id="contact"
      className="py-12 border-t bg-muted/50
      w-full
      flex flex-col items-center justify-center
      ">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.webp" alt="Logo" className="w-[100px] h-10" />
            </div>
            <p className="text-muted-foreground">
              {t("landing", "footer.description" as any)}
            </p>

            <div
              className={`flex ${
                isRTL ? "flex-row-reverse" : "flex-row"
              } space-x-4 rtl:space-x-reverse mt-2`}>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              {t("landing", "footer.product" as any)}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors">
                  {t("landing", "navigation.features" as any)}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-primary transition-colors">
                  {t("landing", "navigation.pricing" as any)}
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="hover:text-primary transition-colors">
                  {t("auth", "signInTitle" as any)}
                </a>
              </li>
              <li>
                <a
                  href="/signup"
                  className="hover:text-primary transition-colors">
                  {t("auth", "signUpTitle" as any)}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              {t("landing", "footer.support" as any)}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors">
                  {t("sidebar", "contact" as any)}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors">
                  {t("sidebar", "faq" as any)}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-terms"
                  className="hover:text-primary transition-colors">
                  {t("sidebar", "privacyTerms" as any)}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                support@docuchatai.com
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-2"></i>
                +1 (555) 123-4567
              </li>
              <li className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>
                San Francisco, CA
              </li>
              <li className="mt-4">
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Get in Touch
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 DocuChatAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
