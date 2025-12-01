import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

const targetingSchema = z.object({
  audience: z.string().min(1, "Target audience is required"),
  ageRange: z
    .object({
      min: z.number().min(18, "Minimum age is 18").max(65, "Maximum age is 65"),
      max: z.number().min(18, "Minimum age is 18").max(65, "Maximum age is 65"),
    })
    .refine((data) => data.min <= data.max, {
      message: "Minimum age must be less than or equal to maximum age",
      path: ["min"],
    }),
  genders: z.array(z.string()).min(1, "Select at least one gender"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  locations: z.array(z.string()).min(1, "Select at least one location"),
  devices: z.array(z.string()).min(1, "Select at least one device type"),
  budgetType: z.enum(["impressions", "clicks"]),
  dailyBudget: z.number().min(10, "Minimum daily budget is $10"),
});

type TargetingData = z.infer<typeof targetingSchema>;

interface TargetingFormProps {
  onSubmit: (data: TargetingData) => void;
  defaultValues?: Partial<TargetingData>;
  isLoading?: boolean;
}
export const locationOptions = [
  { value: "riyadh", label: "Riyadh / الرياض" },
  { value: "jeddah", label: "Jeddah / جدة" },
  { value: "mecca", label: "Mecca / مكة" },
  { value: "medina", label: "Medina / المدينة المنورة" },
  { value: "dammam", label: "Dammam / الدمام" },
  { value: "khobar", label: "Khobar / الخبر" },
  { value: "dhahran", label: "Dhahran / الظهران" },
  { value: "jubail", label: "Jubail / الجبيل" },
  { value: "tabuk", label: "Tabuk / تبوك" },
  { value: "abha", label: "Abha / أبها" },
  { value: "khamis-mushait", label: "Khamis Mushait / خميس مشيط" },
  { value: "taif", label: "Taif / الطائف" },
  { value: "qassim", label: "Qassim / القصيم" },
  { value: "buraydah", label: "Buraydah / بريدة" },
  { value: "hail", label: "Hail / حائل" },
  { value: "najran", label: "Najran / نجران" },
  { value: "jazan", label: "Jazan / جازان" },
  { value: "yanbu", label: "Yanbu / ينبع" },
  { value: "al-kharj", label: "Al Kharj / الخرج" },
  { value: "hafr-al-batin", label: "Hafr Al Batin / حفر الباطن" },
  { value: "al-baha", label: "Al Baha / الباحة" },
  { value: "ar-ar", label: "Arar / عرعر" },
  { value: "sakaka", label: "Sakaka / سكاكا" },
  { value: "al-majmaah", label: "Al Majma'ah / المجمعة" },
  { value: "al-qatif", label: "Al Qatif / القطيف" },
  { value: "al-zulfi", label: "Al Zulfi / الزلفي" },
];

export function TargetingForm({
  onSubmit,
  defaultValues,
  isLoading,
}: TargetingFormProps) {
  const form = useForm<TargetingData>({
    resolver: zodResolver(targetingSchema),
    defaultValues: {
      audience: "",
      ageRange: { min: 18, max: 65 },
      genders: [],
      interests: [],
      languages: ["ar"],
      locations: [],
      devices: [],
      budgetType: "impressions",
      dailyBudget: 50,
      ...defaultValues,
    },
  });
  const { t } = useLanguage();
  const interestOptions = [
    { value: "technology", label: t("form", "technology") },
    { value: "business", label: t("form", "business") },
    { value: "finance", label: t("form", "finance") },
    { value: "health", label: t("form", "health") },
    { value: "fitness", label: t("form", "fitness") },
    { value: "food", label: t("form", "food") },
    { value: "travel", label: t("form", "travel") },
    { value: "education", label: t("form", "education") },
    { value: "entertainment", label: t("form", "entertainment") },
    { value: "shopping", label: t("form", "shopping") },
    { value: "automotive", label: t("form", "automotive") },
    { value: "real-estate", label: t("form", "realEstate") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("form", "title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Targeting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form", "primaryAudience")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-audience">
                          <SelectValue
                            placeholder={t("form", "selectPrimaryAudience")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">
                          {t("form", "audienceOptions.general")}
                        </SelectItem>
                        <SelectItem value="young-adults">
                          {t("form", "audienceOptions.youngAdults")}
                        </SelectItem>
                        <SelectItem value="professionals">
                          {t("form", "audienceOptions.professionals")}
                        </SelectItem>
                        <SelectItem value="business-owners">
                          {t("form", "audienceOptions.businessOwners")}
                        </SelectItem>
                        <SelectItem value="students">
                          {t("form", "audienceOptions.students")}
                        </SelectItem>
                        <SelectItem value="parents">
                          {t("form", "audienceOptions.parents")}
                        </SelectItem>
                        <SelectItem value="seniors">
                          {t("form", "audienceOptions.seniors")}
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
                    <FormLabel>{t("form", "budgetType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-type">
                          <SelectValue
                            placeholder={t("form", "selectBudgetType")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="impressions">
                          {t("form", "budgetOptions.impressions")}
                        </SelectItem>
                        <SelectItem value="clicks">
                          {t("form", "budgetOptions.clicks")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Age Range */}
            <div>
              <FormLabel>{t("form", "ageRange")}</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="ageRange.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("form", "minAgePlaceholder")}
                          min="18"
                          max="65"
                          data-testid="input-min-age"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 18)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageRange.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("form", "maxAgePlaceholder")}
                          min="18"
                          max="65"
                          data-testid="input-max-age"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 65)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Gender */}
            <FormField
              control={form.control}
              name="genders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form", "gender")}</FormLabel>
                  <div className="flex items-center gap-6 mt-2">
                    {["male", "female", "all"].map((gender) => (
                      <div key={gender} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gender-${gender}`}
                          checked={field.value?.includes(gender)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), gender]
                              : (field.value || []).filter(
                                  (value) => value !== gender
                                );
                            field.onChange(updatedValue);
                          }}
                          data-testid={`checkbox-gender-${gender}`}
                        />
                        <label
                          htmlFor={`gender-${gender}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                          {t("form", `genders.${gender}`) || gender}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages */}
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form", "languages")}</FormLabel>
                  <div className="flex items-center gap-6 mt-2">
                    {[
                      { value: "en", label: t("form", "languageOptions.en") },
                      { value: "ar", label: t("form", "languageOptions.ar") },
                      {
                        value: "both",
                        label: t("form", "languageOptions.both"),
                      },
                    ].map((lang) => (
                      <div
                        key={lang.value}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang.value}`}
                          checked={field.value?.includes(lang.value)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), lang.value]
                              : (field.value || []).filter(
                                  (value) => value !== lang.value
                                );
                            field.onChange(updatedValue);
                          }}
                          data-testid={`checkbox-language-${lang.value}`}
                        />
                        <label
                          htmlFor={`lang-${lang.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {lang.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interests */}
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form", "interests")}</FormLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {interestOptions.map((interest) => (
                      <div
                        key={interest.value}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${interest.value}`}
                          checked={field.value?.includes(interest.value)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), interest.value]
                              : (field.value || []).filter(
                                  (value) => value !== interest.value
                                );
                            field.onChange(updatedValue);
                          }}
                          data-testid={`checkbox-interest-${interest.value}`}
                        />
                        <label
                          htmlFor={`interest-${interest.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {interest.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Locations */}
            <FormField
              control={form.control}
              name="locations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form", "locations")}</FormLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {locationOptions.map((location) => (
                      <div
                        key={location.value}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.value}`}
                          checked={field.value?.includes(location.value)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), location.value]
                              : (field.value || []).filter(
                                  (value) => value !== location.value
                                );
                            field.onChange(updatedValue);
                          }}
                          data-testid={`checkbox-location-${location.value}`}
                        />
                        <label
                          htmlFor={`location-${location.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {location.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Daily Budget */}
            <FormField
              control={form.control}
              name="dailyBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form", "dailyBudget")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        ر.س
                      </span>
                      <Input
                        type="number"
                        placeholder="50"
                        min="10"
                        step="1"
                        className="pl-8"
                        data-testid="input-daily-budget"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 10)
                        }
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.watch("budgetType") === "impressions"
                      ? t("form", "approxImpressions").replace(
                          "{count}",
                          `${Math.floor((field.value || 0) * 1000)}`
                        )
                      : t("form", "basedOnCPC")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-save-targeting">
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mx-2"></i>
                    {t("form", "saving")}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mx-2"></i>
                    {t("form", "saveTargeting")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
