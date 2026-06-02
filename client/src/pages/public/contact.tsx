import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Header } from "@/components/layout/header";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

import { useLanguage } from "@/hooks/use-language";

export default function Contact() {
  const { t, isRTL } = useLanguage();
  const [location] = useLocation();
  const [isUserContact, setIsUserContact] = useState(false);

  // Use useEffect to check the URL and update state
  useEffect(() => {
    setIsUserContact(location.includes("/user-contact"));
  }, [location]);

  return (
    <div
      className={`min-h-screen bg-background ${
        isRTL ? "rtl" : "ltr"
      } flex flex-col`}
      dir={isRTL ? "rtl" : "ltr"}>
      {isUserContact ? (
        <>
        <div className="w-full bg-background">
          {/* <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"> */}
          <div className="flex-1 overflow-auto max-h-[100vh] mb-6">
            <Header
              title={t("contact", "title")}
              description={t("contact", "subtitle")}
            />
          </div>
          {/* </div> */}
        </div>
         </>
      ) : (
        <>
          {/* Hero Section for Public Route */}
          <section className="relative py-20 overflow-hidden ">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
              <div className="text-center space-y-4 mb-16">
                <Badge variant="secondary" className="w-fit mx-auto">
                  <Mail className="w-4 h-4 mx-2" />
                  {t("contact", "getInTouch")}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  {t("contact", "title")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("contact", "subtitle")}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 mt-24">
        <div className="container ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-stretch">
            {/* Contact Information */}
            <div className="space-y-8 w-full">
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {t("contact", "infoTitle")}
                </h2>
                <div className="grid gap-6">
                  {/* Email */}
                  <Card className="w-full border-0 shadow-lg h-full">
                    <CardContent className="p-4 sm:p-6">
                      <div
                        className={`flex items-center ${
                          isRTL ? "space-x-reverse" : "space-x-4"
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {t("contact", "email")}
                          </h3>
                          <p className="text-muted-foreground truncate">
                            info@octopusad.com
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phone */}
                  <Card className="w-full border-0 shadow-lg h-full">
                    <CardContent className="p-4 sm:p-6">
                      <div
                        className={`flex items-center ${
                          isRTL ? "space-x-reverse" : "space-x-4"
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <SiWhatsapp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {t("contact", "phone")}
                          </h3>
                          <p className="text-muted-foreground">0583898606</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Working Hours */}
                  <Card className="w-full border-0 shadow-lg h-full">
                    <CardContent className="p-4 sm:p-6">
                      <div
                        className={`flex items-center ${
                          isRTL ? "space-x-reverse" : "space-x-4"
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {t("contact", "hours")}
                          </h3>
                          <p className="text-muted-foreground">
                            {t("contact", "hoursValue")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">
                    {t("contact", "followUs")}
                  </h3>
                  <div
                    className={`flex flex-wrap items-center gap-3 ${
                      isRTL ? "rtl" : "ltr"
                    }`}>
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
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="w-full">
              <Card className="w-full border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    {t("contact", "whatsappTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-green-500/10 rounded-full flex items-center justify-center">
                    <SiWhatsapp className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-green-500" />
                  </div>
                  <div className="text-center space-y-2 px-4">
                    <h3 className="text-xl font-semibold">
                      {t("contact", "whatsappContact")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("contact", "whatsappDescription")}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                    onClick={() => {
                      window.open(`https://wa.me/966583898606`, "_blank");
                    }}>
                    <SiWhatsapp
                      className={`h-5 w-5 ${isRTL ? "ml-2" : "mx-2"}`}
                    />
                    {t("contact", "openWhatsapp")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
