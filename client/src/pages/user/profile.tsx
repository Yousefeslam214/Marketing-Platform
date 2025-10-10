import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  MapPin,
  Shield,
  Calendar,
  TrendingUp,
  CreditCard,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useLanguage } from "../../hooks/use-language";
import { useToast } from "../../hooks/use-toast";
import { TokenManager } from "../../lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { locationOptions } from "@/components/ads/targeting-form";


interface UpdateProfileData {
  username: string;
  password?: string;
  country: string;
}

export default function Profile() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    country: "",
  });

  // Countries list (you can expand this)

  // Fetch profile data
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    key: ["/profile"],
    url: `${VITE_API_BASE_URL}/api/users/profile`,
  });
  // Update form data when profile loads
  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        username: profileData.data.username || "",
        password: "",
        confirmPassword: "",
        country: profileData.data.country || "",
      });
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.username || formData.username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }

    if (formData.username && formData.username.length > 30) {
      errors.push("Username cannot exceed 30 characters");
    }

    if (formData.password && formData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (formData.password && formData.password.length > 128) {
      errors.push("Password cannot exceed 128 characters");
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.push("New password and confirmation do not match");
    }

    if (!formData.country) {
      errors.push("Please select your country or region");
    }

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updateData: UpdateProfileData = {
        username: formData.username,
        country: formData.country,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TokenManager.getAccessToken()}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: t("profile", "updateSuccess"),
          description: result.message || "Profile updated successfully!",
        });
        setIsEditing(false);
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        refetch(); // Refresh profile data
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (error) {
      toast({
        title: t("profile", "updateError"),
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (profileData?.data) {
      setFormData({
        username: profileData.data.username || "",
        password: "",
        confirmPassword: "",
        country: profileData.data.country || "",
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t("profile", "loading")}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData?.data) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profile data.{" "}
            {error?.message || "Please try refreshing the page."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profile = profileData.data;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("profile", "title")}</h1>
            <p className="text-gray-600 mt-1">{t("profile", "description")}</p>
          </div>
          <div className="space-x-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                {t("profile", "editProfile")}
              </Button>
            ) : (
              <div className="space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isUpdating
                    ? t("profile", "updating")
                    : t("profile", "saveChanges")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {t("profile", "cancel")}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("profile", "basicInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">{t("profile", "username")}</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username (3+ characters)"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.username}</p>
                )}
              </div>

              <div>
                <Label>{t("profile", "email")}</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{profile.email}</span>
                  {profile.verified && (
                    <Badge variant="secondary" className="text-green-600">
                      {t("profile", "verified")}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">{t("profile", "country")}</Label>
                {isEditing ? (
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your country or region" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{profile.country || "Not specified"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Leave password fields empty to keep current password
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="password">
                    New Password{" "}
                    <span className="text-sm text-gray-500">{t("profile", "optional")}</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter a new password (6+ characters)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">{t("profile", "confirmNewPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your new password"
                    disabled={!formData.password}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("profile", "accountDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("profile", "role")}:</span>
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}>
                  {profile.role === "admin"
                    ? t("profile", "admin")
                    : t("profile", "user")}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "accountType")}:
                </span>
                <span>
                  {profile.oauth === "normal"
                    ? t("profile", "regularAccount")
                    : t("profile", "socialMediaAccount")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "memberSince")}:
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{formatDate(profile.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "verificationStatus")}:
                </span>
                <Badge variant={profile.verified ? "default" : "secondary"}>
                  {profile.verified ? t("profile", "yes") : t("profile", "no")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t("profile", "usageStatistics")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "activeCampaigns")}:
                </span>
                <span className="font-semibold">{profile.adsCount}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "totalAmountSpent")}:
                </span>
                <span className="font-semibold">
                  {formatCurrency(profile.totalSpend)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "availableBalance")}:
                </span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(profile.balance)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("profile", "freeViewCredits")}:
                </span>
                <span className="font-semibold">
                  {profile.freeViewsCredits.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
