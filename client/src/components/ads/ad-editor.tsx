import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { createAdSchema, type CreateAdData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
import { locationOptions } from "./targeting-form";
import { useLanguage } from "@/hooks/use-language";

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
        title: (t as any).ads.editor.success.title,
        description: (t as any).ads.editor.success.description,
      });

      // Check if we have a valid AdId
      const adId = data.data?.AdId;
      if (!adId) {
        console.error("No AdId in response:", data);
        toast({
          title: (t as any).ads.editor.warning.title,
          description: (t as any).ads.editor.warning.description,
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
        title: (t as any).ads.editor.error.title,
        description: error.message || (t as any).ads.editor.error.description,
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
        <CardTitle>{(t as any).ads.editor.card.title}</CardTitle>
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
                    <FormLabel>{(t as any).ads.editor.form.titleEn}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          (t as any).ads.editor.form.titleEnPlaceholder
                        }
                        data-testid="input-title-en"
                        {...field}
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
                    <FormLabel>{(t as any).ads.editor.form.titleAr}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          (t as any).ads.editor.form.titleArPlaceholder
                        }
                        dir="rtl"
                        data-testid="input-title-ar"
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
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {(t as any).ads.editor.form.descriptionEn}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          (t as any).ads.editor.form.descriptionEnPlaceholder
                        }
                        className="h-24 resize-none"
                        data-testid="textarea-description-en"
                        {...field}
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
                    <FormLabel>
                      {(t as any).ads.editor.form.descriptionAr}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          (t as any).ads.editor.form.descriptionArPlaceholder
                        }
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
            </div>

            {/* Website URL */}
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{(t as any).ads.editor.form.websiteUrl}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={
                        (t as any).ads.editor.form.websiteUrlPlaceholder
                      }
                      data-testid="input-target-url"
                      {...field}
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
                {(t as any).ads.editor.form.socialMediaLinks}
              </FormLabel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <FormField
                  control={form.control}
                  name="facebookLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {(t as any).ads.editor.form.facebookLink}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder={
                            (t as any).ads.editor.form.facebookPlaceholder
                          }
                          data-testid="input-facebook-link"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://instagram.com/yourprofile"
                          data-testid="input-instagram-link"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://tiktok.com/@yourusername"
                          data-testid="input-tiktok-link"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/channel/yourchannel"
                          data-testid="input-youtube-link"
                          {...field}
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
                      <FormLabel>Snapchat Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://snapchat.com/add/yourusername"
                          data-testid="input-snapchat-link"
                          {...field}
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
                      <FormLabel>Google Ads Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://ads.google.com/your-campaign"
                          data-testid="input-google-ads-link"
                          {...field}
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
                    <FormLabel>
                      {(t as any).ads.editor.form.targetAudience}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-target-audience">
                          <SelectValue
                            placeholder={
                              (t as any).ads.editor.form.selectAudience
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">
                          {(t as any).ads.editor.form.audienceOptions.general}
                        </SelectItem>
                        <SelectItem value="tech">
                          {(t as any).ads.editor.form.audienceOptions.tech}
                        </SelectItem>
                        <SelectItem value="business">
                          {(t as any).ads.editor.form.audienceOptions.business}
                        </SelectItem>
                        <SelectItem value="students">
                          {(t as any).ads.editor.form.audienceOptions.students}
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
                    <FormLabel>
                      {(t as any).ads.editor.form.budgetType}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-type">
                          <SelectValue
                            placeholder={
                              (t as any).ads.editor.form.selectBudgetType
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="impressions">
                          {(t as any).ads.editor.form.budgetOptions.impressions}
                        </SelectItem>
                        <SelectItem value="clicks">
                          {(t as any).ads.editor.form.budgetOptions.clicks}
                        </SelectItem>
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
                    <FormLabel>
                      {(t as any).ads.editor.form.targetCities}
                    </FormLabel>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {locationOptions.map((city) => (
                        <div
                          key={city.value}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={city.value}
                            checked={field.value?.includes(city.value)}
                            onCheckedChange={(checked) => {
                              const currentCities = field.value || [];

                              if (checked) {
                                field.onChange([...currentCities, city.value]); // ✅ store only the value, not the full object
                              } else {
                                field.onChange(
                                  currentCities.filter((c) => c !== city.value)
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
                {(t as any).ads.editor.buttons.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createAdMutation.isPending}
                data-testid="button-save-draft">
                {createAdMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {(t as any).ads.editor.buttons.saving}
                  </>
                ) : (
                  (t as any).ads.editor.buttons.saveDraft
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
