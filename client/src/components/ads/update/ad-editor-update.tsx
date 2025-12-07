import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import { createAdSchema, type CreateAdData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { TokenManager } from "@/lib/auth";
import { locationOptions } from "./../targeting-form";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { navigate } from "wouter/use-browser-location";

interface AdEditorUpdateProps {
  adId: string;
  existingData: Partial<CreateAdData> | any;
  isUpdate?: boolean;
}

// Function to clear all ad-related cache
export const clearAdCache = (adId: string) => {
  queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
  queryClient.invalidateQueries({ queryKey: [`/api/advertising/${adId}`] });
  queryClient.invalidateQueries({ queryKey: ["/ads/approved"] });
  queryClient.invalidateQueries({ queryKey: ["/ads/pending"] });
  queryClient.invalidateQueries({ queryKey: ["/ads/rejected"] });
  queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  queryClient.removeQueries({ queryKey: ["/api/advertising"] });
  queryClient.removeQueries({ queryKey: [`/api/advertising/${adId}`] });
};

export function AdEditor({
  adId,
  existingData,
  isUpdate = false,
}: AdEditorUpdateProps) {
  console.log("existingData:", existingData);
  const imgData = existingData?.imageUrl || [];
  console.log("imageData:", imgData);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<CreateAdData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      titleEn: existingData?.titleEn || "",
      titleAr: existingData?.titleAr || "",
      descriptionEn: existingData?.descriptionEn || "",
      descriptionAr: existingData?.descriptionAr || "",
      websiteUrl: existingData?.websiteUrl || "",
      phoneNumber: existingData?.phoneNumber || "",
      targetAudience: existingData?.targetAudience || "",
      targetCities: (existingData as any)?.targetCities || [],
      budgetType: existingData?.budgetType || "impressions",
      facebookLink: existingData?.facebookLink || "",
      instagramLink: existingData?.instagramLink || "",
      tiktokLink: existingData?.tiktokLink || "",
      youtubeLink: existingData?.youtubeLink || "",
      youtubeVideo: existingData?.youtubeVideo || "",
      snapchatLink: existingData?.snapchatLink || "",
      googleAdsLink: existingData?.googleAdsLink || "",
    },
  });

  // If existingData is loaded asynchronously, reset the form so the defaultValues are applied
  useEffect(() => {
    if (existingData) {
      // provide only the fields we care about to avoid overwriting form state
      form.reset({
        titleEn: existingData.titleEn || "",
        titleAr: existingData.titleAr || "",
        descriptionEn: existingData.descriptionEn || "",
        descriptionAr: existingData.descriptionAr || "",
        websiteUrl: existingData.websiteUrl || "",
        phoneNumber: existingData.phoneNumber || "",
        targetAudience: existingData.targetAudience || "",
        targetCities: existingData.targetCities || [],
        budgetType: existingData.budgetType || "impressions",
        facebookLink: existingData.facebookLink || "",
        instagramLink: existingData.instagramLink || "",
        tiktokLink: existingData.tiktokLink || "",
        youtubeLink: existingData.youtubeLink || "",
        youtubeVideo: existingData.youtubeVideo || "",
        snapchatLink: existingData.snapchatLink || "",
        googleAdsLink: existingData.googleAdsLink || "",
      });
    }
  }, [existingData]);

  const updateAdMutation = useMutation<any, any, CreateAdData>({
    mutationFn: async (data: CreateAdData) => {
      // Log payload for debugging server 500 errors
      console.debug("Updating ad payload:", data);
      console.log("Updating ad payload:", data);
      try {
        const response = await apiRequest(
          "PUT",
          `${VITE_API_BASE_URL}/api/advertising/${adId}`,
          data
        );

        // Read response body as text to include any server error message
        const text = await response.text();
        let body: any = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch (e) {
          body = text;
        }

        queryClient.clear();

        if (!response.ok) {
          const msg =
            body?.message ||
            body ||
            response.statusText ||
            `Status ${response.status}`;
          console.error("Update ad failed:", response.status, msg);
          throw new Error(`${response.status}: ${msg}`);
        }

        return body;
      } catch (err) {
        // rethrow for mutation onError to handle
        throw err;
      }
    },
    onSuccess: () => {
      // Clear all advertising-related cache
      clearAdCache(adId);

      toast({
        title: t("ads", "adUpdatedSuccess"),
        description: t("ads", "adUpdatedDescription"),
      });

      // setLocation(`/campaigns/${adId}`);
      // After success

      console.log("imgData to pass:", imgData);
      navigate(`/ads/${adId}/edit-photo`, { state: { imgData } });

      // navigate(`/ads/${adId}/edit-photo?img=${encodeURIComponent(JSON.stringify(imgData))}`);
    },
    onError: (error: any) => {
      toast({
        title: t("ads", "updateAdFailed"),
        description: error.message || t("ads", "updateAdFailedDescription"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateAdData) => {
    // Helper to validate/normalize URLs: try as-is, then try adding https://, otherwise return empty string

    // Build payload more defensively
    const payload: any = {
      ...data,
      targetCities: Array.isArray((data as any).targetCities)
        ? (data as any).targetCities
        : (data as any).targetCities
        ? [(data as any).targetCities]
        : [],
      facebookLink: data.facebookLink,
      instagramLink: data.instagramLink,
      tiktokLink: data.tiktokLink,
      youtubeLink: data.youtubeLink,
      youtubeVideo: data.youtubeVideo,
      snapchatLink: data.snapchatLink,
      googleAdsLink: data.googleAdsLink,
      phoneNumber: data.phoneNumber || "",
    };

    await updateAdMutation.mutateAsync(payload);
  };

  return (
    <div className="flex flex-col w-full mt-24">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("ads", "updateAdTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6
           
            ">
              <div>
                {/* Title Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="titleAr"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>
                          {t("ads", "titleArLabel")}
                          {/* {t("ads", "titleArPlaceholder")} */}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل عنوان الإعلان..."
                            dir="rtl"
                            data-testid="input-title-ar"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>{t("ads", "titleEnLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("ads", "titleArPlaceholder")}
                            data-testid="input-title-en"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>{t("ads", "descriptionArLabel")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("ads", "descriptionArPlaceholder")}
                            dir="rtl"
                            className="h-24 resize-none"
                            data-testid="textarea-description-ar"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>{t("ads", "descriptionEnLabel")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("ads", "descriptionEnPlaceholder")}
                            className="h-24 resize-none"
                            data-testid="textarea-description-en"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Website URL */}
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "websiteUrlLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder={t("ads", "websiteUrlPlaceholder")}
                          data-testid="input-target-url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="youtubeVideo"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "youtubeVideoLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Audience */}
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "targetAudienceLabel")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        data-testid="select-target-audience">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "ads",
                                "targetAudiencePlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cars">
                            {t("ads", "audienceCars")}
                          </SelectItem>
                          <SelectItem value="realestate">
                            {t("ads", "audienceRealestate")}
                          </SelectItem>
                          <SelectItem value="devices">
                            {t("ads", "audienceDevices")}
                          </SelectItem>
                          <SelectItem value="animals">
                            {t("ads", "audienceAnimals")}
                          </SelectItem>
                          <SelectItem value="furniture">
                            {t("ads", "audienceFurniture")}
                          </SelectItem>
                          <SelectItem value="jobs">
                            {t("ads", "audienceJobs")}
                          </SelectItem>
                          <SelectItem value="services">
                            {t("ads", "audienceServices")}
                          </SelectItem>
                          <SelectItem value="fashion">
                            {t("ads", "audienceFashion")}
                          </SelectItem>
                          <SelectItem value="games">
                            {t("ads", "audienceGames")}
                          </SelectItem>
                          <SelectItem value="rarities">
                            {t("ads", "audienceRarities")}
                          </SelectItem>
                          <SelectItem value="art">
                            {t("ads", "audienceArt")}
                          </SelectItem>
                          <SelectItem value="trips">
                            {t("ads", "audienceTrips")}
                          </SelectItem>
                          <SelectItem value="food">
                            {t("ads", "audienceFood")}
                          </SelectItem>
                          <SelectItem value="gardens">
                            {t("ads", "audienceGardens")}
                          </SelectItem>
                          <SelectItem value="occasions">
                            {t("ads", "audienceOccasions")}
                          </SelectItem>
                          <SelectItem value="tourism">
                            {t("ads", "audienceTourism")}
                          </SelectItem>
                          <SelectItem value="lost">
                            {t("ads", "audienceLost")}
                          </SelectItem>
                          <SelectItem value="coach">
                            {t("ads", "audienceCoach")}
                          </SelectItem>
                          <SelectItem value="code">
                            {t("ads", "audienceCode")}
                          </SelectItem>
                          <SelectItem value="fund">
                            {t("ads", "audienceFund")}
                          </SelectItem>
                          <SelectItem value="more">
                            {t("ads", "audienceMore")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Cities */}
                <FormField
                  control={form.control}
                  name="targetCities"
                  render={({ field }: { field: any }) => {
                    const allCityValues = locationOptions.map(
                      (city) => city.value
                    );
                    const selectedCities = (field.value as string[]) || [];
                    const isAllCitiesSelected = allCityValues.every(
                      (cityValue) => selectedCities.includes(cityValue)
                    );

                    return (
                      <FormItem>
                        <FormLabel>{t("ads", "targetCitiesLabel")}</FormLabel>
                        <div className="space-y-4">
                          {/* All Cities Option */}
                          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                            <Checkbox
                              id="all-cities"
                              checked={isAllCitiesSelected}
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  // Select all individual cities
                                  const allCityValues = locationOptions.map(
                                    (city) => city.value
                                  );
                                  field.onChange(allCityValues);
                                } else {
                                  // Deselect all cities
                                  field.onChange([]);
                                }
                              }}
                            />
                            <label
                              htmlFor="all-cities"
                              className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                              <i className="fas fa-globe mx-2 text-primary"></i>
                              {t("ads", "allCities")}
                            </label>
                          </div>

                          {/* Individual Cities */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {locationOptions.map((city) => (
                              <div
                                key={city.value}
                                className="flex items-center p-2 border rounded-md transition-colors hover:bg-muted/50">
                                <Checkbox
                                  id={city.value}
                                  checked={selectedCities.includes(city.value)}
                                  onCheckedChange={(checked: boolean) => {
                                    const currentCities = selectedCities.filter(
                                      (c) => c !== "all"
                                    ); // Remove any "all" flag

                                    if (checked) {
                                      const newCities = [
                                        ...currentCities,
                                        city.value,
                                      ];
                                      field.onChange(newCities);
                                    } else {
                                      const newCities = currentCities.filter(
                                        (c: string) => c !== city.value
                                      );
                                      field.onChange(newCities);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={city.value}
                                  className="text-sm mx-2  font-medium leading-none 
                              peer-disabled:cursor-not-allowed peer-disabled:opacity-70
                               cursor-pointer flex-1">
                                  {city.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Budget Type */}
                <FormField
                  control={form.control}
                  name="budgetType"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "budgetTypeLabel")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        data-testid="select-budget-type">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("ads", "budgetTypePlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="impressions">
                            {t("ads", "impressions")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Media Links */}
                <div>
                  <FormLabel className="text-base font-semibold">
                    {t("ads", "socialMediaLinksLabel")}
                  </FormLabel>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <FormField
                      control={form.control}
                      name="facebookLink"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>{t("ads", "facebookLinkLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://facebook.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagramLink"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>
                            {t("ads", "instagramLinkLabel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://instagram.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tiktokLink"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>{t("ads", "tiktokLinkLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://tiktok.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="youtubeLink"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>{t("ads", "youtubeLinkLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://youtube.com/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>{t("ads", "whatsappNumber")}</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              inputMode="tel"
                              placeholder="+9665X XXX XXXX"
                              // pattern="^(\+9665|05)\d{8}$"
                              // title="Saudi mobile numbers: 966XXXXXXX or +9665XXXXXXXX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mb-5">
                      <FormField
                        control={form.control}
                        name="snapchatLink"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>
                              {t("ads", "snapchatLinkLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://snapchat.com/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateAdMutation.isPending}
                  data-testid="button-update-ad">
                  {updateAdMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mx-2"></i>
                      {t("ads", "updatingAd")}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mx-2"></i>
                      {t("ads", "updateAdButton")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
