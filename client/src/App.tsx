import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import { AppLayout } from "./components/layout/app-layout";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Dashboard from "@/pages/user/dashboard";
import AdsIndex from "@/pages/user/ads/index";
import NewAd from "@/pages/user/ads/new";
import EditAd from "@/pages/user/ads/edit";
import UploadPhoto from "@/pages/user/ads/upload-photo";
import AssignCredit from "@/pages/user/ads/assign-credit";
import Billing from "@/pages/user/billing";
import PaymentSuccess from "@/pages/user/payment-success";
import PaymentCancel from "@/pages/user/payment-cancel";
import Analytics from "@/pages/user/analytics";
import PublicContact from "@/pages/public/contact";
import PublicFAQ from "@/pages/public/faq";
import PublicPrivacyTerms from "@/pages/public/privacy-terms";
import PrivacyTerms from "@/pages/user/privacy-terms";
import AdsFeed from "@/pages/public/ads-feed";
import AdminBilling from "@/pages/admin/AdminBilling";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/shared/not-found";
import { LanguageProvider } from "./contexts/language-context";
import FAQ from "./pages/user/faq";
import {
  adminAllAdsPath,
  adminApprovedAdsPath,
  adminBillingPath,
  adminPendingAdsPath,
  adminRejectedAdsPath,
  analyticsCampaignPath,
  campaignsPath,
  detailedCampaignsPath,
  editAdPath,
  newCampaignsPath,
} from "./lib/paths";
import ApprovedAds from "./pages/admin/ad/approved-ads";
import RejectedAds from "./pages/admin/ad/rejected-ads";
import PendingAds from "./pages/admin/ad/pending-ads";
import AllAds from "./pages/admin/ad/all-ads";
import AdminUsers from "./pages/admin/users-mangement-page";
import UserDetails from "./pages/admin/user-details-mangement-page";
import AnalyticsToAd from "./pages/user/analytics-to-ad";
import AdDetail from "./pages/shared/ad/[id]";
import LandingPage from "./pages/public/landing";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={LandingPage} />
      <Route path="/contact" component={PublicContact} />
      <Route path="/faq" component={PublicFAQ} />
      <Route path="/privacy-terms" component={PublicPrivacyTerms} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Pages with AppLayout */}
      <Route
        path="/dashboard"
        component={() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      />

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
        path={adminAllAdsPath()}
        component={() => (
          <AppLayout>
            <AllAds />
          </AppLayout>
        )}
      />
      <Route
        path={analyticsCampaignPath(":id")}
        component={(props: { params: { id: string } }) => (
          <AppLayout>
            <AnalyticsToAd />
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
        path={newCampaignsPath()}
        component={() => (
          <AppLayout>
            <NewAd />
          </AppLayout>
        )}
      />
      <Route
        path={editAdPath(":adId")}
        component={(props: { params: { adId: string } }) => (
          <AppLayout>
            <EditAd />
          </AppLayout>
        )}
      />
      <Route
        path="/ads/:adId/upload-photo"
        component={(props: { params: { adId: string } }) => (
          <AppLayout>
            <UploadPhoto />
          </AppLayout>
        )}
      />
      <Route
        path="/ads/:adId/assign-credit"
        component={(props: { params: { adId: string } }) => (
          <AppLayout>
            <AssignCredit />
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
        path="/faq"
        component={() => (
          <AppLayout>
            <FAQ />
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

      <Route
        path="/feed"
        component={() => (
          <AppLayout>
            <AdsFeed />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/dashboard"
        component={() => (
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        )}
      />

      {/* Public shared pages */}
      <Route path="/feed" component={() => <AdsFeed />} />

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
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
