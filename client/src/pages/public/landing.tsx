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
import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { Check, AlertCircle, RefreshCw, X } from "lucide-react";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { YouTubeLite } from "@/components/landing/YouTubeLite";

// Lazy load heavy components
const WhyChooseSection = lazy(() => import("@/components/landing/WhyChooseSection"));
// Type for pricing data
interface PricingData {
  currency: string;
  impressionsPerUnit: number;
}

export default function LandingPage() {
  const { isRTL, t } = useLanguage();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState(false);

  // Fetch impression ratios from API in the background
  const fetchPricingData = useCallback(async () => {
    try {
      setPricingLoading(true);
      setPricingError(false);

      const response = await fetch(
        `${VITE_API_BASE_URL}/api/users/impression-ratios`
      );
      const data = await response.json();

      if (data.success) {
        // Find SAR pricing data
        const sarData = data.data.find(
          (item: any) => item.currency === "sar"
        );
        setPricingData(sarData);
      } else {
        setPricingError(true);
      }
    } catch (error) {
      // Silently handle error on initial load, only show on retry
      console.error("Failed to fetch pricing data:", error);
      setPricingError(true);
    } finally {
      setPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch pricing data in background after page loads
    fetchPricingData();
  }, [fetchPricingData]);

  const retryFetchPricing = useCallback(() => {
    fetchPricingData();
  }, [fetchPricingData]);

  const premiumFeatures = [
    "pricing.plans.premium.features.featuredAds",
    "pricing.plans.premium.features.topPlacement",
    "pricing.plans.premium.features.marketingTeam",
    "pricing.plans.premium.features.sponsoredCampaigns",
    "pricing.plans.premium.features.instantAnalytics",
  ];

  const freeFeatures = [
    { key: "pricing.plans.free.features.platformPosting", included: true },
    { key: "pricing.plans.free.features.viewReports", included: true },
    { key: "pricing.plans.free.features.noFeaturedAds", included: false },
    { key: "pricing.plans.free.features.noTopPlacement", included: false },
    { key: "pricing.plans.free.features.noMarketingTeam", included: false },
    { key: "pricing.plans.free.features.noSponsoredCampaigns", included: false },
  ];

  //   localStorage.clear();

  return (
    <div
      className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}

      flex flex-col items-center justify-center  w-full
    
    `}>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="container relative px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div
              className={`space-y-6 md:space-y-8 ${isRTL ? "lg:order-2" : ""}`}>
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  {t("landing", "hero.badge")}
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  {t("landing", "hero.title")}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                  {t("landing", "hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    <i className="fas fa-play-circle mx-2"></i>
                    {t("landing", "hero.getStarted")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById("video-demo")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full sm:w-auto">
                  <i className="fas fa-video mx-2"></i>
                  {t("landing", "hero.watchDemo")}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mx-2"></i>
                  {t("landing", "hero.features.noSetup")}
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mx-2"></i>
                  {t("landing", "hero.features.marketingForYourAds")}
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mx-2"></i>
                  {t("landing", "hero.features.analytics")}
                </div>
              </div>
            </div>

            <div
              className={`relative mt-8 lg:mt-0 ${isRTL ? "lg:order-1" : ""}`}>
              <div className="relative bg-gradient-to-br from-primary to-secondary rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <div className="bg-background rounded-lg p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold">
                      {t("landing", "hero.dashboard.title")}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {t("landing", "hero.dashboard.live")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                        2.5K
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("landing", "hero.dashboard.campaigns")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">
                        85%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("landing", "hero.dashboard.engagement")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">
                        12.4K
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("landing", "hero.dashboard.leads")}
                      </div>
                    </div>
                  </div>
                  <div className="h-24 sm:h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-end justify-center p-2 sm:p-4">
                    <div className="text-center">
                      <i className="fas fa-chart-line text-xl sm:text-2xl md:text-3xl text-primary mb-1 sm:mb-2"></i>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {t("landing", "hero.dashboard.performance")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section
        id="video-demo"
        className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/50 w-full">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto">
          <div className="text-center space-y-4 mb-12 md:mb-16">
            <Badge variant="default" className="mb-4">
              <i className="fas fa-play-circle mx-2"></i>
              {t("landing", "videoDemo.badge")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
              {t("landing", "videoDemo.title")}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("landing", "videoDemo.subtitle")}
            </p>
          </div>

          <div className="w-full max-w-[1400px] mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-muted aspect-video hover:shadow-3xl transition-shadow duration-300">
              <YouTubeLite
                videoId="gwBP6M3l5LI"
                title="Octopus Ads Platform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Explanation */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Main Message */}
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                {t("landing", "simpleExplanation.title")}
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                {t("landing", "simpleExplanation.subtitle")}
              </p>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-rocket text-primary text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    {t("landing", "simpleExplanation.benefits.easy.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      "landing",
                      "simpleExplanation.benefits.easy.description"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-users text-green-500 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    {t("landing", "simpleExplanation.benefits.team.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      "landing",
                      "simpleExplanation.benefits.team.description"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-globe text-blue-500 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    {t("landing", "simpleExplanation.benefits.reach.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      "landing",
                      "simpleExplanation.benefits.reach.description"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-wallet text-orange-500 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    {t(
                      "landing",
                      "simpleExplanation.benefits.affordable.title"
                    )}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      "landing",
                      "simpleExplanation.benefits.affordable.description"
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Simple Steps */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
                {t("landing", "simpleExplanation.stepsTitle")}
              </h3>

              <div className="space-y-8">
                {/* <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      {t("landing", "simpleExplanation.steps.step1.title")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(
                        "landing",
                        "simpleExplanation.steps.step1.description"
                      )}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      {t("landing", "simpleExplanation.steps.step2.title")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(
                        "landing",
                        "simpleExplanation.steps.step2.description"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      {t("landing", "simpleExplanation.steps.step3.title")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(
                        "landing",
                        "simpleExplanation.steps.step3.description"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      {t("landing", "simpleExplanation.steps.step4.title")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(
                        "landing",
                        "simpleExplanation.steps.step4.description"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA in steps section */}
              <div className="mt-12 text-center">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8">
                    <i className="fas fa-rocket mx-2"></i>
                    {t("landing", "simpleExplanation.cta")}
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("landing", "simpleExplanation.ctaSubtext")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            {t("landing", "features.title")}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landing", "features.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: "fas fa-rocket",
              titleKey: "features.items.easySetup.title",
              descKey: "features.items.easySetup.description",
            },
            {
              icon: "fas fa-chart-bar",
              titleKey: "features.items.analytics.title",
              descKey: "features.items.analytics.description",
            },
            {
              icon: "fas fa-globe",
              titleKey: "features.items.marketingForYourAds.title",
              descKey: "features.items.marketingForYourAds.description",
            },
            {
              icon: "fas fa-shield-alt",
              titleKey: "features.items.secure.title",
              descKey: "features.items.secure.description",
            },
            {
              icon: "fas fa-clock",
              titleKey: "features.items.realTime.title",
              descKey: "features.items.realTime.description",
            },
            {
              icon: "fas fa-headset",
              titleKey: "features.items.support.title",
              descKey: "features.items.support.description",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className={`${feature.icon} text-primary text-xl`}></i>
                </div>
                <CardTitle className="text-xl">
                  {t("landing", feature.titleKey as any)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("landing", feature.descKey as any)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Choose Section */}
      <Suspense fallback={
          <div className="py-12 sm:py-16 md:py-20 flex justify-center items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
        <WhyChooseSection />
      </Suspense>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {t("landing", "howItWorks.title")}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing", "howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                step: "1",
                icon: "fas fa-user-plus",
                titleKey: "howItWorks.steps.signup.title",
                descKey: "howItWorks.steps.signup.description",
              },
              {
                step: "2",
                icon: "fas fa-cog",
                titleKey: "howItWorks.steps.setup.title",
                descKey: "howItWorks.steps.setup.description",
              },
              {
                step: "3",
                icon: "fas fa-bullhorn",
                titleKey: "howItWorks.steps.create.title",
                descKey: "howItWorks.steps.create.description",
              },
              {
                step: "4",
                icon: "fas fa-chart-line",
                titleKey: "howItWorks.steps.track.title",
                descKey: "howItWorks.steps.track.description",
              },
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i
                      className={`${step.icon} text-primary-foreground text-xl`}></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">
                  {t("landing", step.titleKey as any)}
                </h3>
                <p className="text-muted-foreground">
                  {t("landing", step.descKey as any)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/signup">
              <Button size="lg">
                <i className="fas fa-arrow-right mx-2"></i>
                {t("landing", "howItWorks.getStarted")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-muted/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {t("landing", "pricing.title")}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing", "pricing.subtitle")}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {pricingError ? (
                <Card className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>{t("landing", "pricing.error")}</span>
                    </div>
                    <Button onClick={retryFetchPricing} variant="outline">
                      <RefreshCw className="w-4 h-4 mx-2" />
                      {t("landing", "pricing.retry")}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="border-2 border-primary shadow-xl relative h-full flex flex-col">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-3 py-1">
                      {t("landing", "bestValue")}
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-6 pt-8">
                    <CardTitle className="text-2xl mb-2">
                      {t("landing", "pricing.plans.premium.label")}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("landing", "pricing.plans.premium.name")}
                    </p>
                    {pricingLoading || !pricingData ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-12 bg-muted rounded-md mx-auto w-40"></div>
                        <div className="h-4 bg-muted rounded-md mx-auto w-32"></div>
                        <div className="h-6 bg-muted rounded-md mx-auto w-48 mt-4"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl font-bold text-primary">
                          {(1 / pricingData.impressionsPerUnit).toFixed(3)}{" "}
                          {t("landing", "pricing.currency")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("landing", "pricing.perImpression")}
                        </div>
                        <div className="text-xl font-semibold text-primary mt-4">
                          {pricingData.impressionsPerUnit}{" "}
                          {t("landing", "pricing.impressions")} = 1{" "}
                          {t("landing", "pricing.currency")}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-4">
                      {premiumFeatures.map((feature) => (
                        <div className="flex items-center" key={feature}>
                          <Check className="w-5 h-5 text-green-500 mx-3" />
                          <span className="text-sm">
                            {t("landing", feature as any)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link href="/signup" className="block mt-auto">
                      <Button className="w-full" size="lg">
                        {t("landing", "pricing.getStarted")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 h-full flex flex-col">
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-2xl mb-2">
                    {t("landing", "pricing.plans.free.name")}
                  </CardTitle>
                  <div className="text-4xl font-bold text-primary">
                    {t("landing", "pricing.plans.free.priceLabel")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("landing", "pricing.subtitle")}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <div className="space-y-4">
                    {freeFeatures.map((feature) => (
                      <div className="flex items-center" key={feature.key}>
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mx-3" />
                        ) : (
                          <X className="w-5 h-5 text-destructive mx-3" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "" : "text-muted-foreground"
                          }`}>
                          {t("landing", feature.key as any)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" className="block mt-auto">
                    <Button className="w-full" size="lg" variant="outline">
                      {t("landing", "pricing.getStarted")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-12 sm:py-16 md:py-20 bg-primary w-full
      flex flex-col align-center 
      ">
        <div
          className="container px-4 sm:px-6 lg:px-8
        m-auto
        ">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-primary-foreground">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                10K+
              </div>
              <div className="text-sm sm:text-base text-primary-foreground/80">
                {t("landing", "stats.campaigns")}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                500+
              </div>
              <div className="text-sm sm:text-base text-primary-foreground/80">
                {t("landing", "stats.clients")}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                99.9%
              </div>
              <div className="text-sm sm:text-base text-primary-foreground/80">
                {t("landing", "stats.uptime")}
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                24/7
              </div>
              <div className="text-sm sm:text-base text-primary-foreground/80">
                {t("landing", "stats.support")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 w-full flex flex-col items-center justify-center">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 sm:p-8 md:p-12 text-center text-primary-foreground max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              {t("landing", "cta.title")}
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
              {t("landing", "cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto hover:scale-105 transition-transform hover:text-primary">
                  <i className="fas fa-rocket mx-2"></i>
                  {t("landing", "cta.getStarted")}
                </Button>
              </Link>
              <Link href="tel:583898606" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground text-primary hover:bg-primary-foreground
                  hover:scale-105 transition-transform
                  ">
                  <i className="fas fa-phone mx-2"></i>
                  {t("landing", "cta.contact")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
