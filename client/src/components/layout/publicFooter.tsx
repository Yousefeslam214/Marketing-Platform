import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const PublicFooter = () => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
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
              <img src={theme === "dark" ? "/white.png" : "/logo.png"} alt="Logo" className=" h-10" />
            </div>
            <p className="text-muted-foreground">
              {/* use nested key via dot-path since TranslationKey expects simple keys; getTranslation supports dot-paths */}
              {t("landing", "footer.description")}
            </p>

            <div className={`flex mt-2`}>
              <a
                href="https://x.com/platform66736?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="text-muted-foreground hover:text-primary transition-colors mx-2">
                {/* X logo (replaces Twitter bird) - uses current text color via fill-current */}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-5 h-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z" />
                  </g>
                </svg>
              </a>

              <a
                href="https://www.facebook.com/share/1DzzZxn4jL/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary transition-colors mx-2">
                <i className="fab fa-facebook" />
              </a>
              {/* <a
                // href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors mx-2">
                <i className="fab fa-linkedin" />
              </a> */}
              <a
                href="https://www.instagram.com/octopusadsplatform?igsh=MTA0cWIydzBlc3docw%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary transition-colors mx-2">
                <i className="fab fa-instagram" />
              </a>

              {/* X logo removed from standalone position (already used as link) */}
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
                +966 583 898 606
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

        <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_.6fr]">
          <div className="rounded-lg border border-border bg-card/60 p-5">
            <h4 className="font-semibold text-foreground">
              {t("landing", "footer.complianceTitle")}
            </h4>
            <ul className={`mt-4 space-y-2 text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
              <li>{t("landing", "footer.businessCenterDoc")}</li>
              <li>{t("landing", "footer.commercialRegistry")}</li>
              <li>{t("landing", "footer.freelanceDoc")}</li>
              <li>{t("landing", "footer.adLicense")}</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-5 flex flex-col items-center justify-center text-center">
            <img
              src="/qr.jpeg"
              alt={t("landing", "footer.unifiedCertification")}
              className="h-32 w-32 rounded-md border border-border bg-background object-contain"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              {t("landing", "footer.unifiedCertification")}
            </p>
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
