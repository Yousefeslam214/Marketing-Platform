import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  FileText,
  Eye,
  Lock,
  UserCheck,
  AlertTriangle,
  Calendar,
  Mail,
} from "lucide-react";

export default function PrivacyTerms() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto">
        <Header
          title={t("privacyTerms", "title")}
          description={t("privacyTerms", "subtitle")}
        />

        <main className={`p-6 space-y-6 direction-${isRTL ? "rtl" : "ltr"}`}>
          <div className="flex items-center justify-center gap-2 mb-8 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {t("privacyTerms", "lastUpdated")}: October 3, 2025
          </div>

          {/* Tabs for Privacy Policy and Terms of Service */}
          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("privacyTerms", "privacyPolicy")}
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("privacyTerms", "termsOfService")}
              </TabsTrigger>
            </TabsList>

            {/* Privacy Policy Tab */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 direction-${
                      isRTL ? "rtl" : "ltr"
                    }`}>
                    <Shield
                      className={`h-5 w-5 text-primary direction-${
                        isRTL ? "rtl" : "ltr"
                      }`}
                    />
                    {t("privacyTerms", "privacyTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea
                    className={`h-[600px] pr-4 direction-${
                      isRTL ? "rtl" : "ltr"
                    }`}>
                    <div className="space-y-8">
                      {/* Introduction */}
                      <section className={`direction-${isRTL ? "rtl" : "ltr"}`}>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          {t("privacyTerms", "introductionTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "introductionContent")}
                        </p>
                      </section>

                      {/* Information We Collect */}
                      <section className={`direction-${isRTL ? "rtl" : "ltr"}`}>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <UserCheck className="h-5 w-5" />
                          {t("privacyTerms", "dataCollectionTitle")}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              {t("privacyTerms", "personalInfoTitle")}
                            </h4>
                            <p className="text-muted-foreground">
                              {t("privacyTerms", "personalInfoContent")}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              {t("privacyTerms", "usageDataTitle")}
                            </h4>
                            <p className="text-muted-foreground">
                              {t("privacyTerms", "usageDataContent")}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              {t("privacyTerms", "technicalTitle")}
                            </h4>
                            <p className="text-muted-foreground">
                              {t("privacyTerms", "technicalContent")}
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* How We Use Information */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "dataUseTitle")}
                        </h3>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>• {t("privacyTerms", "dataUseService")}</li>
                          <li>• {t("privacyTerms", "dataUseCommunication")}</li>
                          <li>• {t("privacyTerms", "dataUseImprovement")}</li>
                          <li>• {t("privacyTerms", "dataUseSecurity")}</li>
                          <li>• {t("privacyTerms", "dataUseLegal")}</li>
                        </ul>
                      </section>

                      {/* Data Security */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          {t("privacyTerms", "securityTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "securityContent")}
                        </p>
                      </section>

                      {/* Your Rights */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "rightsTitle")}
                        </h3>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>• {t("privacyTerms", "rightsAccess")}</li>
                          <li>• {t("privacyTerms", "rightsCorrection")}</li>
                          <li>• {t("privacyTerms", "rightsDeletion")}</li>
                          <li>• {t("privacyTerms", "rightsPortability")}</li>
                          <li>• {t("privacyTerms", "rightsObjection")}</li>
                        </ul>
                      </section>

                      {/* Contact */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          {t("privacyTerms", "contactTitle")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("privacyTerms", "contactContent")}
                        </p>
                        <p className="text-primary font-medium mt-2">
                          privacy@Octopus Ad.com
                        </p>
                      </section>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms of Service Tab */}
            <TabsContent value="terms">
              <Card className={`direction-${isRTL ? "rtl" : "ltr"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t("privacyTerms", "termsTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea
                    className={`h-[600px] pr-4 direction-${
                      isRTL ? "rtl" : "ltr"
                    }`}>
                    <div className="space-y-8">
                      {/* Introduction */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "acceptanceTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "acceptanceContent")}
                        </p>
                      </section>

                      {/* Service Description */}
                      <section
                        className={`direction-${isRTL ? "rtl" : "ltr"} `}>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "serviceTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "serviceContent")}
                        </p>
                      </section>

                      {/* User Responsibilities */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "responsibilitiesTitle")}
                        </h3>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>
                            • {t("privacyTerms", "responsibilitiesAccurate")}
                          </li>
                          <li>
                            • {t("privacyTerms", "responsibilitiesLawful")}
                          </li>
                          <li>
                            • {t("privacyTerms", "responsibilitiesSecure")}
                          </li>
                          <li>
                            • {t("privacyTerms", "responsibilitiesRespect")}
                          </li>
                        </ul>
                      </section>

                      {/* Prohibited Uses */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          {t("privacyTerms", "prohibitedTitle")}
                        </h3>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>• {t("privacyTerms", "prohibitedIllegal")}</li>
                          <li>• {t("privacyTerms", "prohibitedHarmful")}</li>
                          <li>• {t("privacyTerms", "prohibitedSpam")}</li>
                          <li>• {t("privacyTerms", "prohibitedInfringe")}</li>
                          <li>• {t("privacyTerms", "prohibitedMalware")}</li>
                        </ul>
                      </section>

                      {/* Payment Terms */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "paymentTitle")}
                        </h3>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            {t("privacyTerms", "paymentBilling")}
                          </p>
                          <p className="text-muted-foreground">
                            {t("privacyTerms", "paymentRefunds")}
                          </p>
                        </div>
                      </section>

                      {/* Intellectual Property */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "intellectualTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "intellectualContent")}
                        </p>
                      </section>

                      {/* Limitation of Liability */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "liabilityTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "liabilityContent")}
                        </p>
                      </section>

                      {/* Termination */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "terminationTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "terminationContent")}
                        </p>
                      </section>

                      {/* Changes to Terms */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4">
                          {t("privacyTerms", "changesTitle")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t("privacyTerms", "changesContent")}
                        </p>
                      </section>

                      {/* Contact */}
                      <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          {t("privacyTerms", "legalContactTitle")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("privacyTerms", "legalContactContent")}
                        </p>
                        <p className="text-primary font-medium mt-2">
                          legal@OctopusAd.com
                        </p>
                      </section>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
