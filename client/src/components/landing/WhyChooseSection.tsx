import { memo } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Users, Target, Megaphone } from "lucide-react";

function WhyChooseSection() {
  const { t, isRTL } = useLanguage();

  // Icons for each point
  const pointIcons = [
    <Star className="w-6 h-6" />, // Create and share for free
    <Users className="w-6 h-6" />, // Professional team
    <Megaphone className="w-6 h-6" />, // Social media advertising
    <Target className="w-6 h-6" />, // Strong network
  ];

  const whyChoosePoints = t(
    "landing",
    "whyChoose.points"
  ) as unknown as string[];

  return (
    <section
      id="why-choose"
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            {t("landing", "whyChoose.title")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>

        {/* Points Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {Array.isArray(whyChoosePoints) &&
              whyChoosePoints.map((point, index) => (
                <Card
                  key={index}
                  className="
                  h-full
                  border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur bg-white -sm">
                  <CardContent className="p-6 sm:p-8">
                    <div
                      className={`flex items-center gap-4 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      {/* Icon Container */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                          {pointIcons[index]}
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className="h-full flex flex-col
               justify-center
               items-center
               ">
                        <div className="flex-1 space-y-2">
                          <div
                            className={`flex items-center gap-2 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}>
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p
                              className={`text-base sm:text-lg font-medium text-foreground leading-relaxed ${
                                isRTL ? "text-right" : "text-left"
                              }`}>
                              {point}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(WhyChooseSection);
