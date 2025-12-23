import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import { SeoProvider } from "./contexts/seo-context";
import { AppLayout } from "./components/layout/app-layout";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import GoogleCallback from "@/pages/auth/google-callback";
import GoogleDirectAuth from "@/pages/auth/google-direct-auth";
import GoogleFailure from "@/pages/auth/google-failure";
import Dashboard from "@/pages/user/dashboard";
import AdsIndex from "@/pages/user/ads/index";
import NewAd from "@/pages/user/ads/new";
import EditAd from "@/pages/user/ads/edit";
import AdAnalytics from "@/pages/user/ads/analytics";
// import UploadPhoto from "@/pages/user/ads/upload-photo";
import AssignCredit from "@/pages/user/ads/assign-credit";
import Billing from "@/pages/user/billing";
import PaymentSuccess from "@/pages/user/payment-success";
import PaymentCancel from "@/pages/user/payment-cancel";
import Analytics from "@/pages/user/analytics";
import Profile from "@/pages/user/profile";
import PublicContact from "@/pages/public/contact";
// import PublicContactArabic from "@/pages/public/contact-ar";
import PublicFAQ from "@/pages/public/faq";
// import PublicFAQArabic from "@/pages/public/faq-ar";
import PublicPrivacyTerms from "@/pages/public/privacy-terms";
// import PublicPrivacyTermsArabic from "@/pages/public/privacy-terms-ar";
import PrivacyTerms from "@/pages/user/privacy-terms";
import AdsFeed from "@/pages/public/ads-feed";
import PaymentSuccessPage from "@/pages/shared/payment-success";
import PaymentFailedPage from "@/pages/shared/payment-failed";
import AdminBilling from "@/pages/admin/AdminBilling";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/shared/not-found";
import { LanguageProvider } from "./contexts/language-context";
// import FAQ from "./pages/user/faq";
import {
  adminAllAdsPath,
  adminApprovedAdsPath,
  adminBillingPath,
  adminPendingAdsPath,
  adminRejectedAdsPath,
  campaignsPath,
  detailedCampaignsPath,
  editAdPath,
  editCampaignsPath,
  newCampaignsPath,
  publicFreeFeedPath,
} from "./lib/paths";
import ApprovedAds from "./pages/admin/ad/approved-ads";
import RejectedAds from "./pages/admin/ad/rejected-ads";
import PendingAds from "./pages/admin/ad/pending-ads";
import AllAds from "./pages/admin/ad/all-ads";
import AdminUsers from "./pages/admin/users-mangement-page";
import UserDetails from "./pages/admin/user-details-mangement-page";
import AdDetail from "./pages/shared/ad/[id]";
import LandingPage from "./pages/public/landing";
import { PublicLayout } from "./components/layout/public-layout";
import { TokenManager } from "./lib/auth";
import AdminImpressionRatios from "./pages/admin/AdminImpressionRatios";
import AdminFreeCredits from "./pages/admin/AdminFreeCredits";
import UploadPhoto from "./components/ads/create/upload-photo";
import EditPhoto from "./components/ads/update/edit-photo";
import AdminPixels from "./pages/admin/pixels/pixels";
import AdReports from "./pages/admin/AdReports";
import SeoSettings from "./pages/admin/SeoSettings";
import GoogleAnalytics from "./analytics/GoogleAnalytics";
import TikTokPixel from "./analytics/TikTokPixel";
import MarketingLinksPage from "./pages/public/marketing-links";
import FreeAdsFeed from "./pages/public/free-ads-feed";

function Router() {
  const [, setLocation] = useLocation();

  const role = TokenManager.getRole();
  let auth = false;
  if (TokenManager.getAccessToken()) auth = true;

  function DashboardRoute() {
    const [, setLocation] = useLocation();
    useEffect(() => {
      const r = TokenManager.getRole();
      if (r === "admin") setLocation("/admin/dashboard");
    }, [setLocation]);

    return (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    );
  }

  //   if (!TokenManager.getAccessToken()) {
  //   // setLocation("/login");
  //   // return null;
  // }
  return (
    <Switch>
      {/* Public pages */}
      {!auth ? (
        <Route
          path="/feed"
          component={() => (
            <PublicLayout>
              <AdsFeed />
            </PublicLayout>
          )}
        />
      ) : (
        <Route
          path="/feed"
          component={() => (
            <AppLayout>
              <AdsFeed />
            </AppLayout>
          )}
        />
      )}
      <Route
        path="/"
        component={() => (
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        )}
      />
      <Route
        path="/marketing-links"
        component={() => (
          <AppLayout>
            <MarketingLinksPage />
          </AppLayout>
        )}
      />
      <Route
        path="/contact"
        component={() => (
          <PublicLayout>
            <PublicContact />
          </PublicLayout>
        )}
      />
      <Route
        path="/faq"
        component={() => (
          <PublicLayout>
            <PublicFAQ />
          </PublicLayout>
        )}
      />
      <Route
        path="/privacy-terms"
        component={() => (
          <PublicLayout>
            <PublicPrivacyTerms />
          </PublicLayout>
        )}
      />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/auth/google/callback" component={GoogleCallback} />
      <Route path="/google/callback" component={GoogleCallback} />
      <Route path="/google/failure" component={() => <GoogleFailure />} />
      <Route path="/api/auth/google/login" component={GoogleDirectAuth} />

      <Route path={publicFreeFeedPath()} component={FreeAdsFeed}/>

      {/* Payment result pages */}
      <Route
        path="/payment-success"
        component={() => (
          <PublicLayout>
            <PaymentSuccessPage />
          </PublicLayout>
        )}
      />
      <Route
        path="/payment-failed"
        component={() => (
          <PublicLayout>
            <PaymentFailedPage />
          </PublicLayout>
        )}
      />
      <Route
        path="/user-contact"
        component={() => (
          <AppLayout>
            <PublicContact />
          </AppLayout>
        )}
      />
      {/* Pages with AppLayout */}
      <Route
        path={adminPendingAdsPath()}
        component={() => (
          <AppLayout>
            <PendingAds />
          </AppLayout>
        )}
      />
      <Route
        path={adminRejectedAdsPath()}
        component={() => (
          <AppLayout>
            <RejectedAds />
          </AppLayout>
        )}
      />
      <Route
        path={adminApprovedAdsPath()}
        component={() => (
          <AppLayout>
            <ApprovedAds />
          </AppLayout>
        )}
      />
      <Route
        path="/pixels"
        component={() => (
          <AppLayout>
            <AdminPixels />
          </AppLayout>
        )}
      />
      <Route
        path={adminAllAdsPath()}
        component={() => (
          <AppLayout>
            <AllAds />
          </AppLayout>
        )}
      />

      <Route
        path={campaignsPath()}
        component={() => (
          <AppLayout>
            <AdsIndex />
          </AppLayout>
        )}
      />
      <Route
        path="/ads"
        component={() => (
          <AppLayout>
            <AdsIndex />
          </AppLayout>
        )}
      />
      <Route
        path={newCampaignsPath()}
        component={() => (
          <AppLayout>
            <NewAd />
          </AppLayout>
        )}
      />
      <Route
        path={editAdPath(":adId")}
        component={() => (
          <AppLayout>
            <EditAd />
          </AppLayout>
        )}
      />
      <Route
        path={editCampaignsPath(":adId")}
        component={() => (
          <AppLayout>
            <EditAd />
          </AppLayout>
        )}
      />
      <Route
        path="/ads/:adId/upload-photo"
        component={() => (
          <AppLayout>
            <UploadPhoto />
          </AppLayout>
        )}
      />
      <Route
        path="/ads/:adId/edit-photo"
        component={() => (
          <AppLayout>
            <EditPhoto />
          </AppLayout>
        )}
      />
      <Route
        path="/ads/:adId/assign-credit"
        component={() => (
          <AppLayout>
            <AssignCredit />
          </AppLayout>
        )}
      />
      <Route
        path="/campaigns/:id/analytics"
        component={() => (
          <AppLayout>
            <AdAnalytics />
          </AppLayout>
        )}
      />
      <Route
        path={detailedCampaignsPath()}
        component={(props: { params: { id: string } }) => (
          <AppLayout>
            <AdDetail params={props.params} />
          </AppLayout>
        )}
      />
      <Route
        path="/billing"
        component={() => (
          <AppLayout>
            <Billing />
          </AppLayout>
        )}
      />
      <Route path="/billing/success" component={() => <PaymentSuccess />} />
      <Route path="/success" component={() => <PaymentSuccess />} />
      <Route path="/billing/cancel" component={() => <PaymentCancel />} />
      <Route
        path="/user-faq"
        component={() => (
          <AppLayout>
            <PublicFAQ />
          </AppLayout>
        )}
      />
      <Route
        path="/analytics"
        component={() => (
          <AppLayout>
            <Analytics />
          </AppLayout>
        )}
      />
      <Route
        path="/profile"
        component={() => (
          <AppLayout>
            <Profile />
          </AppLayout>
        )}
      />
      <Route
        path="/privacy-terms"
        component={() => (
          <AppLayout>
            <PrivacyTerms />
          </AppLayout>
        )}
      />
      {/* <Route
        path="/admin/pending"
        component={() => (
          <AppLayout>
            <AdminPending />
          </AppLayout>
        )}
      /> */}
      <Route
        path="/admin/users"
        component={() => (
          <AppLayout>
            <AdminUsers />
          </AppLayout>
        )}
      />

      <Route
        path="/admin/user-details/:id"
        component={() => (
          <AppLayout>
            <UserDetails />
          </AppLayout>
        )}
      />
      <Route
        path={adminBillingPath()}
        component={() => (
          <AppLayout>
            <AdminBilling />
          </AppLayout>
        )}
      />

      <Route path="/dashboard" component={DashboardRoute} />
      <Route
        path="/admin/dashboard"
        component={() => (
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/impression-ratios"
        component={() => (
          <AppLayout>
            <AdminImpressionRatios />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/free-credits"
        component={() => (
          <AppLayout>
            <AdminFreeCredits />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/ad-reports"
        component={() => (
          <AppLayout>
            <AdReports />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/seo"
        component={() => (
          <AppLayout>
            <SeoSettings />
          </AppLayout>
        )}
      />
      <Route
        path="/feed"
        component={() => (
          <AppLayout>
            {/* <PublicHeader /> */}
            <AdsFeed />
          </AppLayout>
        )}
      />

      {/* <Route
        path="/public/:id"
        component={(props: { params: { id: string } }) => (
          <AppLayout>
            <PublicAd params={props.params} />
          </AppLayout>
        )}
      /> */}
      {/* Fallback 404 */}
      <Route
        component={() => (
          <AppLayout>
            <NotFound />
          </AppLayout>
        )}
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <SeoProvider>
              <TooltipProvider>
                {/* GA4 page view tracker for SPA navigation */}
                <GoogleAnalytics />
                {/* TikTok Pixel tracker */}
                <TikTokPixel />
                <Router />
                <Toaster />
              </TooltipProvider>
            </SeoProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
