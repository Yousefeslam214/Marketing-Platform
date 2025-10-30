export function homePath() {
  return "/";
}
export function ticketsPath() {
  return "/tickets";
}
export function ticketPath(ticketId: string) {
  return `/tickets/${ticketId}`;
}

// Auth routes
export function loginPath() {
  return "/login";
}

export function registerPath() {
  return "/register";
}

export function forgotPasswordPath() {
  return "/forgot-password";
}

// Admin routes
export function adminDashboardPath() {
  return "/admin/dashboard";
}

export function adminUsersPath() {
  return "/admin/users";
}

export function adminAllAdsPath() {
  return "/ads/all";
}

export function adminPendingAdsPath() {
  return "/ads/pending";
}

export function adminApprovedAdsPath() {
  return "/ads/approved";
}

export function adminRejectedAdsPath() {
  return "/ads/rejected";
}

export function adminAnalyticsPath() {
  return "/admin/analytics";
}

export function adminSettingsPath() {
  return "/admin/settings";
}

// User routes
export function userDashboardPath() {
  return "/dashboard";
}

export function campaignsPath() {
  return "/campaigns";
}
export function newCampaignsPath() {
  return "/campaigns/new";
}
export function detailedCampaignsPath() {
  return "/campaigns/:id";
}

export function userBillingPath() {
  return "/billing";
}

export function userAnalyticsPath() {
  return "/analytics";
}

export function userProfilePath() {
  return "/profile";
}

export function userSettingsPath() {
  return "/settings";
}

// General routes
export function faqPath() {
  return "/faq";
}

export function helpPath() {
  return "/help";
}

export function contactPath() {
  return "/contact";
}

export function privacyTermsPath() {
  return "/privacy-terms";
}

export function termsPath() {
  return "/terms";
}

export function privacyPath() {
  return "/privacy";
}

// Marketing routes
export function marketingDashboardPath() {
  return "/marketing/dashboard";
}

export function marketingCampaignsPath() {
  return "/marketing/campaigns";
}

export function marketingAnalyticsPath() {
  return "/marketing/analytics";
}

// Dynamic routes
export function adPath(adId: string) {
  return `/ads/${adId}`;
}

export function userPath(userId: string) {
  return `/users/${userId}`;
}

export function editAdPath(adId: string) {
  return `/ads/${adId}/edit`;
}
export function editCampaignsPath(adId: string) {
  return `/ads/${adId}/edit`;
}

export function adminBillingPath() {
  return `/admin/adminBilling`;
}

// Public routes
export function publicFeedPath() {
  return "/feed";
}

export function handleCreateAd() {
  return "/campaigns/new";
}

export function handleViewAd(id: string) {
  return `/campaigns/${id}`;
}

export function handleEditAd(id: string) {
  return `/ads/${id}/edit`;
}

export function handleAnalytics(id: string) {
  return `/campaigns/${id}/analytics`;
}

export function handlePurchase() {
  return `/billing`;
}
