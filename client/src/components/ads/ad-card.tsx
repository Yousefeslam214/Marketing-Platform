// components/ads/ad-card.tsx
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdData } from "@/lib/schema/schema-ads";

interface AdCardProps {
  ad: AdData;
  language?: "en" | "ar";
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAnalytics?: (id: string) => void;
  onPurchase?: (id: string) => void;
  showActions?: boolean;
}

export function AdCard({
  ad,
  language = "en",
  onView,
  onEdit,
  onAnalytics,
  onPurchase,
  showActions = true,
}: AdCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "approved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "draft":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return "fas fa-check-circle";
      case "approved":
        return "fas fa-thumbs-up";
      case "pending":
        return "fas fa-clock";
      case "rejected":
        return "fas fa-times-circle";
      case "draft":
        return "fas fa-edit";
      default:
        return "fas fa-question-circle";
    }
  };

  const title = language === "ar" ? ad.titleAr : ad.titleEn;
  const description = language === "ar" ? ad.descriptionAr : ad.descriptionEn;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow min-w-[350px]"
      data-testid={`ad-card-${ad.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-foreground truncate mb-1"
              data-testid={`ad-title-${ad.id}`}
              dir={language === "ar" ? "rtl" : "ltr"}>
              {title}
            </h3>
            <p
              className="text-sm text-muted-foreground truncate"
              data-testid={`ad-description-${ad.id}`}
              dir={language === "ar" ? "rtl" : "ltr"}>
              {description}
            </p>
          </div>
          <Badge
            className={`${getStatusColor(
              ad.status
            )} ml-2 flex items-center gap-1 flex-shrink-0`}>
            <i className={`${getStatusIcon(ad.status)} text-xs`}></i>
            {ad.status}
          </Badge>
        </div>

        {ad.imageUrl && (
          <div className="w-full h-32 bg-muted rounded-lg mb-4 overflow-hidden">
            <img
              src={ad.imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              data-testid={`ad-image-${ad.id}`}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4 w-[80%] ">
            <span
              data-testid={`ad-audience-${ad.id}`}
              className="flex flex-col items-center justify-center text-center max-w-[50%]">
              <i className="fas fa-users mb-1"></i>
              {ad.targetAudience}
            </span>
            <span
              data-testid={`ad-budget-${ad.id}`}
              className="flex flex-col items-center justify-center text-center max-w-[50%]">
              <i className="fas fa-dollar-sign mr-1"></i>
              {ad.budgetType}
            </span>
          </div>
          <span
            data-testid={`ad-date-${ad.id}`}
            className="flex flex-col items-center justify-center text-center w-20 truncate max-w-[50%]">
            <i className="fas fa-calendar-alt mb-1"></i>
            {new Date(ad.createdAt).toLocaleDateString()}
          </span>
        </div>

        {showActions && (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(ad.id)}
                className="flex-1"
                data-testid={`button-view-ad-${ad.id}`}>
                <i className="fas fa-eye mr-1"></i>
                {language === "ar" ? "عرض" : "View"}
              </Button>

              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(ad.id)}
                  className="flex-1"
                  data-testid={`button-edit-ad-${ad.id}`}>
                  <i className="fas fa-edit mr-1"></i>
                  {language === "ar" ? "تعديل" : "Edit"}
                </Button>
              )}

              {onAnalytics && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAnalytics(ad.id)}
                  className="flex-1"
                  data-testid={`button-analytics-ad-${ad.id}`}>
                  <i className="fas fa-chart-bar mr-1"></i>
                  {language === "ar" ? "إحصائيات" : "Analytics"}
                </Button>
              )}
            </div>

            {ad.status === "approved" && onPurchase && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onPurchase(ad.id)}
                className="w-full mt-3"
                data-testid={`button-purchase-ad-${ad.id}`}>
                <i className="fas fa-credit-card mr-1"></i>
                {language === "ar" ? "شراء انطباعات" : "Purchase Impressions"}
              </Button>
            )}

            {ad.status === "published" && (
              <div className="mt-3 pt-3 border-t border-border">
                <Link href={`/ad/${ad.id}`}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    data-testid={`link-public-ad-${ad.id}`}>
                    <i className="fas fa-external-link-alt"></i>
                    {language === "ar" ? "عرض الإعلان العام" : "View Public Ad"}
                  </a>
                </Link>
              </div>
            )}
          </>
        )}

        {ad.rejectionReason && (
          <div className="mt-3 pt-3 border-t border-border">
            <p
              className="text-xs text-destructive"
              data-testid={`ad-rejection-reason-${ad.id}`}>
              <strong>
                {language === "ar" ? "سبب الرفض:" : "Rejection Reason:"}
              </strong>{" "}
              {ad.rejectionReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
