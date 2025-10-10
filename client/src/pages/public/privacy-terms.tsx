import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  Shield,
  ArrowLeft,
  FileText,
  Lock,
  Eye,
  Globe,
  UserCheck,
  Scale,
} from "lucide-react";
import PublicHeader from "@/components/layout/publicHeader";
import PublicFooter from "@/components/layout/publicFooter";

export default function PrivacyTerms() {
  const { t, isRTL } = useLanguage();

  // Get sections from translations
  const privacySections = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: t("privacyTerms", "personalInfoTitle"),
      content: t("privacyTerms", "personalInfoContent"),
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: t("privacyTerms", "dataUseTitle"),
      content:
        t("privacyTerms", "dataUseService") +
        ". " +
        t("privacyTerms", "dataUseCommunication") +
        ".",
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: t("privacyTerms", "securityTitle"),
      content: t("privacyTerms", "securityContent"),
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: t("privacyTerms", "rightsTitle"),
      content:
        t("privacyTerms", "rightsAccess") +
        ", " +
        t("privacyTerms", "rightsCorrection") +
        ", " +
        t("privacyTerms", "rightsDeletion") +
        ".",
    },
  ];

  const termsSections = [
    {
      icon: <Scale className="w-5 h-5" />,
      title: t("privacyTerms", "acceptanceTitle"),
      content: t("privacyTerms", "acceptanceContent"),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: t("privacyTerms", "serviceTitle"),
      content: t("privacyTerms", "serviceContent"),
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: t("privacyTerms", "responsibilitiesTitle"),
      content:
        t("privacyTerms", "responsibilitiesAccurate") +
        ". " +
        t("privacyTerms", "responsibilitiesLawful") +
        ".",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t("privacyTerms", "terminationTitle"),
      content: t("privacyTerms", "terminationContent"),
    },
  ];

  return (
    <div
      className={`min-h-screen bg-background 
        flex flex-col align-center
        ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="container relative">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Shield className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("privacyTerms", "lastUpdated")}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              {t("privacyTerms", "title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("privacyTerms", "subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2
                className={`text-3xl font-bold mb-8 flex items-center
                   `}>
                <Shield
                  className={`w-8 h-8 text-primary ${isRTL ? "ml-3" : "mr-3"}`}
                />
                {t("privacyTerms", "privacyTitle")}
              </h2>
              <div className="grid gap-6">
                {privacySections.map((section, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {section.icon}
                        </div>
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact for Privacy */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {t("privacyTerms", "contactTitle")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("privacyTerms", "contactContent")}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">Email: info@octopusad.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Terms of Service */}
            <div>
              <h2
                className={`text-3xl font-bold mb-8 flex items-center 
                `}>
                <Scale
                  className={`w-8 h-8 text-primary ${isRTL ? "ml-3" : "mr-3"}`}
                />
                {t("privacyTerms", "termsTitle")}
              </h2>
              <div className="grid gap-6">
                {termsSections.map((section, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {section.icon}
                        </div>
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Legal Contact */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {t("privacyTerms", "legalContactTitle")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("privacyTerms", "legalContactContent")}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">Email: info@octopusad.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {t("faq", "stillNeedHelp")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("faq", "supportTeamHere")}
                </p>
                <div
                  className={`flex flex-col sm:flex-row gap-4 justify-center ${
                    isRTL ? "space-x-reverse" : ""
                  }`}>
                  <Link href="/contact">
                    <Button size="lg">{t("faq", "contactSupport")}</Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="outline" size="lg">
                      {t("sidebar", "faq")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
