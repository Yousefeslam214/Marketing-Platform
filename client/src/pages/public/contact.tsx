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
      className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}
      flex flex-col items-center
      `}
      dir={isRTL ? "rtl" : "ltr"}>
      
      {isUserContact ? (
        <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
          <div className="flex-1 overflow-auto">
            <Header
              title={t("contact", "title")}
              description={t("contact", "subtitle")}
            />
            {/* Contact Content for User Route */}
            <section className="py-6">
              <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Contact Information */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-6">
                        {t("contact", "infoTitle")}
                      </h2>
                      <div className="grid gap-6">
                        {/* Email */}
                        <Card className="border-0 shadow-lg">
                          <CardContent className="p-6">
                            <div
                              className={`flex items-center space-x-4 ${
                                isRTL ? "space-x-reverse" : ""
                              }`}>
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Mail className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {t("contact", "email")}
                                </h3>
                                <p className="text-muted-foreground">
                                  info@octopusad.com
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Phone */}
                        <Card className="border-0 shadow-lg">
                          <CardContent className="p-6">
                            <div
                              className={`flex items-center space-x-4 ${
                                isRTL ? "space-x-reverse" : ""
                              }`}>
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <SiWhatsapp className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {t("contact", "phone")}
                                </h3>
                                <p className="text-muted-foreground">0502274696</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Working Hours */}
                        <Card className="border-0 shadow-lg">
                          <CardContent className="p-6">
                            <div
                              className={`flex items-center space-x-4 ${
                                isRTL ? "space-x-reverse" : ""
                              }`}>
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="h-6 w-6 text-primary" />
                              </div>
                              <div>
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
                      <div className="mt-8 flex flex-col">
                        <h3 className="text-xl font-bold mb-4">
                          {t("contact", "followUs")}
                        </h3>
                        <div
                          className={`flex space-x-4 ${
                            isRTL ? "space-x-reverse" : ""
                          }`}>
                          <a
                            href="#"
                            className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Facebook className="h-5 w-5" />
                          </a>
                          {/* <a
                            href="#"
                            className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Twitter className="h-5 w-5" />
                          </a> */}
                          <a
                            href="#"
                            className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Instagram className="h-5 w-5" />
                          </a>
                          <a
                            href="#"
                            className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                            <Linkedin className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Contact */}
                  <div>
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl text-center">
                          {t("contact", "whatsappTitle")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center">
                          <SiWhatsapp className="h-16 w-16 text-green-500" />
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-semibold">
                            {t("contact", "whatsappContact")}
                          </h3>
                          <p className="text-muted-foreground">
                            {t("contact", "whatsappDescription")}
                          </p>
                        </div>
                        <Button
                          size="lg"
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                          onClick={() => {
                            window.open(`https://wa.me/966502274696`, '_blank');
                          }}
                        >
                          <SiWhatsapp className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("contact", "openWhatsapp")}
                        </Button>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            {t("contact", "phoneNumber")}: +966 50 227 4696
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section for Public Route */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
            <div className="container relative">
              <div className="text-center space-y-4 mb-16">
                <Badge variant="secondary" className="w-fit mx-auto">
                  <Mail className="w-4 h-4 mr-2" />
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
          {/* Contact Content for Public Route */}
          <section className="py-20">
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {t("contact", "infoTitle")}
                </h2>
                <div className="grid gap-6">
                  {/* Email */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "email")}
                          </h3>
                          <p className="text-muted-foreground">
                            info@octopusad.com
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phone */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <SiWhatsapp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "phone")}
                          </h3>
                          <p className="text-muted-foreground">0502274696</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address */}
                  {/* <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {t("contact", "address")}
                          </h3>
                          <p className="text-muted-foreground">
                            {t("contact", "addressValue")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                  {/* Working Hours */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center space-x-4 ${
                          isRTL ? "space-x-reverse" : ""
                        }`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
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
                <div className="mt-8 flex flex-col">
                  <h3 className="text-xl font-bold mb-4">
                    {t("contact", "followUs")}
                  </h3>
                  <div
                    className={`flex space-x-4 ${
                      isRTL ? "space-x-reverse" : ""
                    }`}>
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                    {/* <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a> */}
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    {t("contact", "whatsappTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center">
                    <SiWhatsapp className="h-16 w-16 text-green-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">
                      {t("contact", "whatsappContact")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("contact", "whatsappDescription")}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                    onClick={() => {
                      window.open(`https://wa.me/966502274696`, '_blank');
                    }}
                  >
                    <SiWhatsapp className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("contact", "openWhatsapp")}
                  </Button>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("contact", "phoneNumber")}: +966 50 227 4696
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
