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
import WorkerHome from "@/pages/worker-home";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsLoggedIn(true);
      setUserRole(user.role);
    } else if (location !== "/login" && location !== "/check-in") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole(null);
    setLocation("/login");
  };

  // Not logged in - show login or check-in
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

  // Logged in as employee - show worker interface
  if (userRole === "employee") {
    return (
      <Switch>
        <Route path="/" component={WorkerHome} />
        <Route path="/check-in" component={CheckIn} />
        <Route path="/login" component={Login} />
        <Route>
          <WorkerHome />
        </Route>
      </Switch>
    );
  }

  // Logged in as manager or admin - show manager interface
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
