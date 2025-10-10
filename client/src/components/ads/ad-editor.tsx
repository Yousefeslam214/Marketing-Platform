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
import { locationOptions } from "./targeting-form";

export function AdEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<CreateAdData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      websiteUrl: "",
      targetAudience: "",
      targetCities: ["riyadh"],
      budgetType: "impressions",
      facebookLink: "",
      instagramLink: "",
      tiktokLink: "",
      youtubeLink: "",
      snapchatLink: "",
      googleAdsLink: "",
    },
  });

  const createAdMutation = useMutation({
    mutationFn: async (data: CreateAdData) => {
      const response = await apiRequest(
        "POST",
        `${VITE_API_BASE_URL}/api/advertising`,
        data
      );
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
        console.error("No AdId in response:", data);
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
    <Card>
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
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Image Upload */}
            {/* <div>
              <FormLabel>Ad Image</FormLabel>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mt-2">
                <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground mb-4"></i>
                <p className="text-sm font-medium text-foreground mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG up to 5MB
                </p>
                <input type="file" className="hidden" accept="image/*" />
              </div>
            </div> */}

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
                />
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
                            placeholder={
                              t("ads", "targetAudiencePlaceholder")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">{t("ads", "audienceGeneral")}</SelectItem>
                        <SelectItem value="cars">{t("ads", "audienceCars")}</SelectItem>
                        <SelectItem value="tech">{t("ads", "audienceTech") || "Tech"}</SelectItem>
                        <SelectItem value="machines">{t("ads", "audienceMachines")}</SelectItem>
                        <SelectItem value="students">{t("ads", "audienceStudents")}</SelectItem>
                        <SelectItem value="animals">{t("ads", "audienceAnimals")}</SelectItem>
                        <SelectItem value="furniture">{t("ads", "audienceFurniture")}</SelectItem>
                        <SelectItem value="services">{t("ads", "audienceServices")}</SelectItem>
                        <SelectItem value="jobs">{t("ads", "audienceJobs")}</SelectItem>
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
                            placeholder={
                              t("ads", "budgetTypePlaceholder")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="impressions">{t("ads", "impressions")}</SelectItem>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ads", "targetCitiesLabel")}</FormLabel>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {locationOptions.map((city) => (
                        <div
                          key={city.value}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={city.value}
                            checked={(field.value as string[])?.includes(
                              city.value
                            )}
                            onCheckedChange={(checked) => {
                              const currentCities =
                                (field.value as string[]) || [];

                              if (checked) {
                                field.onChange([...currentCities, city.value]); // ✅ store only the value, not the full object
                              } else {
                                field.onChange(
                                  currentCities.filter(
                                    (c: string) => c !== city.value
                                  )
                                ); // ✅ remove correctly
                              }
                            }}
                          />
                          <div className="mx-2">
                            <label
                              htmlFor={city.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize
                            mx-2">
                              {city.label} {/* ✅ show readable label */}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
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
                    <i className="fas fa-spinner fa-spin mr-2"></i>
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
