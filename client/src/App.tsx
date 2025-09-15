import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Dashboard from "@/pages/dashboard";
import AdsIndex from "@/pages/ads/index";
import NewAd from "@/pages/ads/new";
import AdDetail from "@/pages/ads/[id]";
import AdminPending from "@/pages/admin/pending";
import AdminUsers from "@/pages/admin/users";
import Billing from "@/pages/billing";
import Analytics from "@/pages/analytics";
import PublicAd from "@/pages/public/ad/[id]";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/campaigns" component={AdsIndex} />
      <Route path="/campaigns/new" component={NewAd} />
      <Route path="/campaigns/:id" component={AdDetail} />
      <Route path="/admin/pending" component={AdminPending} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/billing" component={Billing} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/public/:id" component={PublicAd} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
