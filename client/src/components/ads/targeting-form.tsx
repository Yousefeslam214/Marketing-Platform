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
import { Badge } from "@/components/ui/badge";

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
      languages: ["en"],
      locations: [],
      devices: [],
      budgetType: "impressions",
      dailyBudget: 50,
      ...defaultValues,
    },
  });

  const interestOptions = [
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "finance", label: "Finance" },
    { value: "health", label: "Health & Wellness" },
    { value: "fitness", label: "Fitness" },
    { value: "food", label: "Food & Dining" },
    { value: "travel", label: "Travel" },
    { value: "education", label: "Education" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "automotive", label: "Automotive" },
    { value: "real-estate", label: "Real Estate" },
  ];

  const locationOptions = [
    { value: "saudi-arabia", label: "Saudi Arabia" },
    { value: "riyadh", label: "Riyadh" },
    { value: "jeddah", label: "Jeddah" },
    { value: "dammam", label: "Dammam" },
    { value: "mecca", label: "Mecca" },
    { value: "medina", label: "Medina" },
    { value: "gcc", label: "GCC Countries" },
    { value: "middle-east", label: "Middle East" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Targeting & Budget</CardTitle>
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
                    <FormLabel>Primary Audience</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-audience">
                          <SelectValue placeholder="Select primary audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">
                          General Audience
                        </SelectItem>
                        <SelectItem value="young-adults">
                          Young Adults (18-30)
                        </SelectItem>
                        <SelectItem value="professionals">
                          Working Professionals
                        </SelectItem>
                        <SelectItem value="business-owners">
                          Business Owners
                        </SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="parents">Parents</SelectItem>
                        <SelectItem value="seniors">Seniors (50+)</SelectItem>
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
                    <FormLabel>Budget Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-type">
                          <SelectValue placeholder="Select budget type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="impressions">
                          Pay per 1000 impressions
                        </SelectItem>
                        <SelectItem value="clicks">Pay per click</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Age Range */}
            <div>
              <FormLabel>Age Range</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="ageRange.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Min age"
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
                          placeholder="Max age"
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
                  <FormLabel>Gender</FormLabel>
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
                          {gender}
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
                  <FormLabel>Languages</FormLabel>
                  <div className="flex items-center gap-6 mt-2">
                    {[
                      { value: "en", label: "English" },
                      { value: "ar", label: "Arabic" },
                      { value: "both", label: "Both" },
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
                  <FormLabel>Interests</FormLabel>
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
                  <FormLabel>Locations</FormLabel>
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

            {/* Devices */}
            <FormField
              control={form.control}
              name="devices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Types</FormLabel>
                  <div className="flex items-center gap-6 mt-2">
                    {[
                      { value: "mobile", label: "Mobile" },
                      { value: "tablet", label: "Tablet" },
                      { value: "desktop", label: "Desktop" },
                    ].map((device) => (
                      <div
                        key={device.value}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={`device-${device.value}`}
                          checked={field.value?.includes(device.value)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), device.value]
                              : (field.value || []).filter(
                                  (value) => value !== device.value
                                );
                            field.onChange(updatedValue);
                          }}
                          data-testid={`checkbox-device-${device.value}`}
                        />
                        <label
                          htmlFor={`device-${device.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {device.label}
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
                  <FormLabel>Daily Budget (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
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
                      ? `Approximately ${Math.floor(
                          (field.value || 0) * 1000
                        )} impressions per day`
                      : `Based on estimated cost per click`}
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
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Targeting
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
