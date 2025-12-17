import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdSchema, type CreateAdData } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { locationOptions } from "../targeting-form";
// import { locationOptions } from "./targeting-form";

export function AdEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<CreateAdData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      websiteUrl: "",
      phoneNumber: "",
      targetAudience: "",
      targetCities: [],
      budgetType: "impressions",
      facebookLink: "",
      instagramLink: "",
      tiktokLink: "",
      youtubeLink: "",
      youtubeVideo: "",
      snapchatLink: "",
      googleAdsLink: "",
    },
  });

  const createAdMutation = useMutation({
    mutationFn: async (data: CreateAdData) => {
      console.log(data);
      const response = await apiRequest(
        "POST",
        `${VITE_API_BASE_URL}/api/advertising`,
        data
      );
      queryClient.clear();

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertising"] });
      toast({
        title: t("ads", "newAd.createSuccess"),
        description: t("ads", "newAd.description"),
      });

      // Check if we have a valid AdId
      const adId = data.data?.AdId;
      if (!adId) {
        toast({
          title: t("ads", "newAd.createFailed"),
          description: t("ads", "updateAdFailedDescription"),
          variant: "destructive",
        });
        setLocation("/ads"); // Redirect to ads list instead
        return;
      }

      // Redirect to photo upload page
      const uploadUrl = `/ads/${adId}/upload-photo`;

      setLocation(uploadUrl);
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
    await createAdMutation.mutateAsync(data);
  };

  return (
    <Card className="mt-24">
      <CardHeader>
        <CardTitle>{t("ads", "newAd.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="titleAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "titleArLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("ads", "titleArPlaceholder")}
                        dir="rtl"
                        data-testid="input-title-ar"
                        {...field} // field is of type { field: any }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "titleEnLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("ads", "titleEnPlaceholder")}
                        data-testid="input-title-en"
                        {...field} // field is of type { field: any }
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "descriptionArLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("ads", "descriptionArPlaceholder")}
                        dir="rtl"
                        className="h-24 resize-none"
                        data-testid="textarea-description-ar"
                        {...field} // field is of type { field: any }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "descriptionEnLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("ads", "descriptionEnPlaceholder")}
                        className="h-24 resize-none"
                        data-testid="textarea-description-en"
                        {...field} // field is of type { field: any }
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ads", "websiteUrlLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("ads", "websiteUrlPlaceholder")}
                      data-testid="input-target-url"
                      {...field} // field is of type { field: any }
                    />
                  </FormControl>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "facebookLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://facebook.com/..."
                          data-testid="input-facebook-link"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "instagramLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://instagram.com/yourprofile"
                          data-testid="input-instagram-link"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktokLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "tiktokLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://tiktok.com/@yourusername"
                          data-testid="input-tiktok-link"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtubeLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "youtubeLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/channel/yourchannel"
                          data-testid="input-youtube-link"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtubeVideo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "youtubeVideoLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          data-testid="input-youtube-video"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="snapchatLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "snapchatLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://snapchat.com/add/yourusername"
                          data-testid="input-snapchat-link"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "whatsappNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          inputMode="tel"
                          placeholder="+966XXXXXXXXX"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="googleAdsLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ads", "googleAdsLinkLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://ads.google.com/your-campaign"
                          data-testid="input-google-ads-link"
                          {...field} // field is of type { field: any }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            </div>

            {/* Target Audience and Budget Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "targetAudienceLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-target-audience">
                          <SelectValue
                            placeholder={t("ads", "targetAudiencePlaceholder")}
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

              <FormField
                control={form.control}
                name="budgetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "budgetTypeLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-type">
                          <SelectValue
                            placeholder={t("ads", "budgetTypePlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="impressions">
                          {t("ads", "impressions")}
                        </SelectItem>
                        {/* <SelectItem value="clicks">
                          {(t as any).ads.editor.form.budgetOptions.clicks}
                        </SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Target Cities */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="targetCities"
                render={({ field }) => {
                  const currentCities = (field.value as string[]) || [];
                  const allLocationValues = locationOptions
                    .map((o) => o.value)
                    .filter((v) => v && v !== "all");
                  const isAllCitiesSelected =
                    currentCities.includes("all") ||
                    (allLocationValues.length > 0 &&
                      allLocationValues.every((v) =>
                        currentCities.includes(v)
                      ));

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
                                // Select all cities: expand to actual location values
                                const allLocations = locationOptions
                                  .map((o) => o.value)
                                  .filter((v) => v && v !== "all");
                                field.onChange(allLocations);
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
                              className={`flex items-center space-x-2 p-2 border rounded-md transition-colors  `}>
                              <Checkbox
                                className="mx-2"
                                id={city.value}
                                checked={
                                  isAllCitiesSelected ||
                                  (field.value as string[])?.includes(
                                    city.value
                                  )
                                }
                                // disabled={isAllCitiesSelected}
                                onCheckedChange={(checked: boolean) => {
                                  const currentCities =
                                    (field.value as string[]) || [];
                                  // Remove "all" if it exists when selecting individual cities
                                  const filteredCities = currentCities.filter(
                                    (c) => c !== "all"
                                  );

                                  if (checked) {
                                    field.onChange([
                                      ...filteredCities,
                                      city.value,
                                    ]);
                                  } else {
                                    field.onChange(
                                      filteredCities.filter(
                                        (c: string) => c !== city.value
                                      )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={city.value}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
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
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/campaigns")}
                data-testid="button-cancel">
                {t("profile", "actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createAdMutation.isPending}
                data-testid="button-save-draft">
                {createAdMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mx-2"></i>
                    {t("ads", "uploading")}
                  </>
                ) : (
                  t("ads", "createAd")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
