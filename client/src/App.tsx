import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LocationTracking from "@/pages/location-tracking";
import VerificationImages from "@/pages/verification-images";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import CheckIn from "@/pages/check-in";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    } else if (location !== "/login" && location !== "/check-in") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setLocation("/login");
  };

  if (!isLoggedIn && location !== "/check-in") {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/check-in" component={CheckIn} />
        <Route>
          <Login />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/location-tracking" component={LocationTracking} />
      <Route path="/verification-images" component={VerificationImages} />
      <Route path="/employees" component={Employees} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/login" component={Login} />
      <Route path="/check-in" component={CheckIn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
