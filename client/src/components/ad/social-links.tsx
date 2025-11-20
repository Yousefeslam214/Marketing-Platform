import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface Props {
  ad: any;
}

export default function SocialLinks({ ad }: Props) {
  const { t } = useLanguage();

  if (
    !(
      ad?.websiteUrl ||
      ad?.phoneNumber ||
      ad?.facebookLink ||
      ad?.instagramLink ||
      ad?.tiktokLink ||
      ad?.youtubeLink ||
      ad?.snapchatLink
    )
  )
    return null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("analytics", "socialMediaLinks")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ad.websiteUrl && (
            <a
              href={ad.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 dark:text-gray-200 hover:underline text-sm truncate"
              data-testid="ad-website-link">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                <i className="fab fa-website text-gray-800 dark:text-gray-200 text-lg"></i>
                {t("analytics", "website")}
              </div>
            </a>
          )}

          {ad.facebookLink && (
            <a
              href={ad.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm truncate"
              data-testid="ad-facebook-link">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <i className="fab fa-facebook text-blue-600 text-lg"></i>
                {t("analytics", "facebook")}
              </div>
            </a>
          )}

          {ad.instagramLink && (
            <a
              href={ad.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:underline text-sm truncate"
              data-testid="ad-instagram-link">
              <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
                <i className="fab fa-instagram text-pink-600 text-lg"></i>
                {t("analytics", "instagram")}
              </div>
            </a>
          )}

          {ad.tiktokLink && (
            <a
              href={ad.tiktokLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 dark:text-gray-200 hover:underline text-sm truncate"
              data-testid="ad-tiktok-link">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                <i className="fab fa-tiktok text-gray-800 dark:text-gray-200 text-lg"></i>
                {t("analytics", "tiktok")}
              </div>
            </a>
          )}

          {ad.youtubeLink && (
            <a
              href={ad.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline text-sm truncate"
              data-testid="ad-youtube-link">
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <i className="fab fa-youtube text-red-600 text-lg"></i>
                {t("analytics", "youtube")}
              </div>
            </a>
          )}

          {ad.snapchatLink && (
            <a
              href={ad.snapchatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:underline text-sm truncate"
              data-testid="ad-snapchat-link">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <i className="fab fa-snapchat text-yellow-500 text-lg"></i>
                {t("analytics", "snapchat")}
              </div>
            </a>
          )}

          {ad.phoneNumber &&
            (() => {
              const raw = String(ad.phoneNumber || "");
              const sanitized = raw.replace(/\D/g, "");
              const waHref = sanitized
                ? `https://wa.me/${sanitized}`
                : `tel:${raw}`;
              return (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline text-sm truncate"
                  data-testid="ad-whatsapp-link">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <i className="fab fa-whatsapp text-green-600 text-lg"></i>
                    {t("ads", "phoneNumber")} {raw}
                  </div>
                </a>
              );
            })()}
        </div>
      </CardContent>
    </Card>
  );
}
