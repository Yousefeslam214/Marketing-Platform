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
// import AdDetail from "@/pages/user/ads/[id]";
import Billing from "@/pages/user/billing";
import PaymentSuccess from "@/pages/user/payment-success";
import PaymentCancel from "@/pages/user/payment-cancel";
import Analytics from "@/pages/user/analytics";

import AdminPending from "@/pages/admin/pending";
// import AdminUsers from "@/pages/admin/users";
import MarketingQueue from "@/pages/admin/queue";
import AdminBilling from "@/pages/admin/AdminBilling";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// import PublicAd from "@/pages/shared/ad/[id]";
import NotFound from "@/pages/shared/not-found";

import { LanguageProvider } from "./contexts/language-context";
import FAQ from "./pages/user/faq";
import {
  adminAllAdsPath,
  adminApprovedAdsPath,
  adminPendingAdsPath,
  adminRejectedAdsPath,
} from "./lib/paths";
import ApprovedAds from "./pages/shared/ad/approved-ads";
import RejectedAds from "./pages/shared/ad/rejected-ads";
import PendingAds from "./pages/shared/ad/pending-ads";
import AllAds from "./pages/shared/ad/all-ads";
import AdminUsers from "./pages/admin/users-mangement-page";
import AdDetail from "./pages/shared/ad/[id]";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Pages with AppLayout */}
      <Route
        path="/"
        component={() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      />
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
        path="/campaigns"
        component={() => (
          <AppLayout>
            <AdsIndex />
          </AppLayout>
        )}
      />
      <Route
        path="/campaigns/new"
        component={() => (
          <AppLayout>
            <NewAd />
          </AppLayout>
        )}
      />
      <Route
        path="/campaigns/:id"
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

      {/* Admin pages */}
      <Route
        path="/admin/queue"
        component={() => (
          <AppLayout>
            <MarketingQueue />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/pending"
        component={() => (
          <AppLayout>
            <AdminPending />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/users"
        component={() => (
          <AppLayout>
            <AdminUsers />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/adminBilling"
        component={() => (
          <AppLayout>
            <AdminBilling />
          </AppLayout>
        )}
      />
      <Route
        path="/admin/adminDashboard"
        component={() => (
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        )}
      />

      {/* Public shared pages */}
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
