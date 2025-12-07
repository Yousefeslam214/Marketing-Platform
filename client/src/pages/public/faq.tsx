import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageCircle,
  CreditCard,
  Shield,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function FAQ() {
  const { t, isRTL } = useLanguage();
  const [location] = useLocation();
  const [isUserFaq, setIsUserFaq] = useState(false);

  // Use useEffect to check the URL and update state
  useEffect(() => {
    setIsUserFaq(location.includes("/user-faq"));
  }, [location]);
  // Define the FAQ item type
  type FAQItem = {
    question: string;
    answer: string;
  };

  // Get FAQ categories from translations
  const faqCategories: {
    icon: JSX.Element;
    title: string;
    items: FAQItem[];
  }[] = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: t("faq", "categories.general.title"),
      items:
        (t("faq", "categories.general.questions") as unknown as FAQItem[]) ||
        [],
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: t("faq", "categories.billing.title"),
      items:
        (t("faq", "categories.billing.questions") as unknown as FAQItem[]) ||
        [],
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: t("faq", "categories.adManagement.title"),
      items:
        (t(
          "faq",
          "categories.adManagement.questions"
        ) as unknown as FAQItem[]) || [],
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t("faq", "categories.security.title"),
      items:
        (t("faq", "categories.security.questions") as unknown as FAQItem[]) ||
        [],
    },
  ];

  return (
    <div className={`flex h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex-1 overflow-auto max-h-[100vh]">
        {isUserFaq ? (
          <Header
            title={t("faq", "title")}
            description={t("faq", "description")}
          />
        ) : (
          <>
            {/* Hero Section */}
            <section
              className="relative py-20 overflow-hidden
      w-full
        flex flex-col items-center
      ">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
              <div className="container relative">
                <div className="text-center space-y-4 mb-16">
                  <Badge variant="secondary" className="w-fit mx-auto">
                    <HelpCircle
                      className={`w-4 h-4 ${isRTL ? "ml-2" : "mx-2"}`}
                    />
                    {t("faq", "helpCenter")}
                  </Badge>
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                    {t("faq", "title")}
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {t("faq", "description")}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
        {/* FAQ Content */}
        <section
          className="py-5 w-full
      flex flex-col items-center ">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {faqCategories.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          {category.icon}
                        </div>
                        <span>{category.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {(Array.isArray(category.items)
                          ? category.items
                          : []
                        ).map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${categoryIndex}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {item?.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item?.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Need More Help */}
              <Card className="mt-12 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
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
                    <Button variant="outline" size="lg">
                      <Clock className={`w-4 h-4 ${isRTL ? "ml-2" : "mx-2"}`} />
                      {t("faq", "scheduleCall")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section
          className="py-16 bg-muted/50
      
      w-full
      flex flex-col items-center
      ">
          <div className="container">
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto ${
                isRTL ? "rtl" : "ltr"
              }`}>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">24h</div>
                <div className="text-muted-foreground">
                  {t("faq", "averageResponseTime")}
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-muted-foreground">
                  {t("faq", "customerSatisfaction")}
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-muted-foreground">
                  {t("faq", "supportAvailable")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
