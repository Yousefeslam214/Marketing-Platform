import { useLanguage } from "@/hooks/use-language";
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const PublicFooter = () => {
  const { t } = useLanguage();
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
              {/* use nested key via dot-path since TranslationKey expects simple keys; getTranslation supports dot-paths */}
              {t("landing", "footer.description")}
            </p>

            <div
              className={`flex   mt-2
              
              `}>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors
                mx-2
                ">
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className=" mx-2 text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="#"
                className="  mx-2 text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="#"
                className="mx-2 text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              {t("landing", "footer.product")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors">
                  {t("landing", "navigation.features")}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-primary transition-colors">
                  {t("landing", "navigation.pricing")}
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="hover:text-primary transition-colors">
                  {t("auth", "signInTitle")}
                </a>
              </li>
              <li>
                <a
                  href="/signup"
                  className="hover:text-primary transition-colors">
                  {t("auth", "signUpTitle")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              {t("landing", "footer.support")}
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors">
                  {t("sidebar", "contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors">
                  {t("sidebar", "faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-terms"
                  className="hover:text-primary transition-colors">
                  {t("sidebar", "privacyTerms")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("sidebar", "contact")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <i className="fas fa-envelope mx-2"></i>
                info@octopusad.com
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mx-2"></i>
                0502274696
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
          <p>{t("landing", "footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
