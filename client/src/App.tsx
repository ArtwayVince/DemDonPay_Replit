import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { BottomNav } from "@/components/bottom-nav";
import HomePage from "@/pages/home";
import OrganizationsPage from "@/pages/organizations";
import OrganizationDetailPage from "@/pages/organization-detail";
import ProfilePage from "@/pages/profile";
import NotificationsPage from "@/pages/notifications";
import OrganizationModerationPage from "@/pages/organization-moderation";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component, ...rest }: any) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {() => <PrivateRoute component={HomePage} />}
      </Route>
      <Route path="/organizations">
        {() => <PrivateRoute component={OrganizationsPage} />}
      </Route>
      <Route path="/org/:slug">
        {() => <PrivateRoute component={OrganizationDetailPage} />}
      </Route>
      <Route path="/moderation/organizations">
        {() => <PrivateRoute component={OrganizationModerationPage} />}
      </Route>
      <Route path="/notifications">
        {() => <PrivateRoute component={NotificationsPage} />}
      </Route>
      <Route path="/profile">
        {() => <PrivateRoute component={ProfilePage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const currentPath = window.location.pathname;

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          {isAuthenticated && currentPath !== "/login" && <BottomNav />}
        </TooltipProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
