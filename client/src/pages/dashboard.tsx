import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmployeeMap } from "@/components/dashboard/EmployeeMap";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { VerificationImages } from "@/components/dashboard/VerificationImages";
import { WorksitesList } from "@/components/dashboard/WorksitesList";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Fetch recent check-ins
  const { data: recentCheckins, isLoading: checkinsLoading } = useQuery({
    queryKey: ["/api/checkins/recent"],
    retry: false,
  });

  // Fetch recent verification images
  const { data: recentImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["/api/verification-images/recent"],
    retry: false,
  });

  // Fetch worksites
  const { data: worksites, isLoading: worksitesLoading } = useQuery({
    queryKey: ["/api/worksites"],
    retry: false,
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  // Format activity data for the ActivityList component
  const formatActivities = () => {
    if (!recentCheckins || recentCheckins.length === 0) {
      return [];
    }

    return recentCheckins.map((checkin: any) => ({
      id: checkin.id,
      userId: checkin.userId,
      userName: checkin.user?.fullName || "Unknown User",
      profileImage: checkin.user?.profileImage,
      locationName: checkin.worksite?.name || "Unknown Location",
      timestamp: checkin.timestamp,
      status: checkin.status,
    }));
  };

  // Format employee location data for the map
  const formatEmployeeLocations = () => {
    if (!recentCheckins || recentCheckins.length === 0) {
      return [];
    }

    // Filter to unique employees (take the most recent check-in)
    const employeeMap = new Map();
    recentCheckins.forEach((checkin: any) => {
      if (!employeeMap.has(checkin.userId) || 
          new Date(checkin.timestamp) > new Date(employeeMap.get(checkin.userId).timestamp)) {
        employeeMap.set(checkin.userId, checkin);
      }
    });

    return Array.from(employeeMap.values()).map((checkin: any) => ({
      id: checkin.userId,
      name: checkin.user?.fullName || "Unknown User",
      latitude: checkin.latitude,
      longitude: checkin.longitude,
      isOnsite: checkin.isOnsite,
      worksiteName: checkin.worksite?.name || "Unknown Location",
    }));
  };

  // Format worksite data for the WorksitesList component
  const formatWorksites = () => {
    if (!worksites || worksites.length === 0) {
      return [];
    }

    // Count active employees at each worksite
    const activeEmployeeCounts = new Map();
    if (recentCheckins) {
      recentCheckins.forEach((checkin: any) => {
        if (checkin.isOnsite) {
          const count = activeEmployeeCounts.get(checkin.worksiteId) || 0;
          activeEmployeeCounts.set(checkin.worksiteId, count + 1);
        }
      });
    }

    return worksites.map((site: any) => ({
      id: site.id,
      name: site.name,
      address: site.address,
      activeEmployees: activeEmployeeCounts.get(site.id) || 0,
    }));
  };

  // Format verification images for the VerificationImages component
  const formatVerificationImages = () => {
    if (!recentImages || recentImages.length === 0) {
      return [];
    }

    return recentImages.map((image: any) => ({
      id: image.id,
      userId: image.userId,
      userName: image.user?.fullName || "Unknown User",
      locationName: image.worksite?.name || "Unknown Location",
      timestamp: image.timestamp,
      imageData: image.imageData,
    }));
  };

  // Handle view all actions
  const handleViewAll = (section: string) => {
    switch (section) {
      case "activities":
        setLocation("/location-tracking");
        break;
      case "images":
        setLocation("/verification-images");
        break;
      case "worksites":
        toast({
          title: "Not Implemented",
          description: "This feature is coming soon!",
          variant: "default",
        });
        break;
      default:
        break;
    }
  };

  // Handle adding a new site
  const handleAddSite = () => {
    toast({
      title: "Not Implemented",
      description: "This feature is coming soon!",
      variant: "default",
    });
  };

  // Handle adding a new verification image
  const handleAddImage = () => {
    setLocation("/check-in");
  };

  // Show loading state
  if (statsLoading || checkinsLoading || imagesLoading || worksitesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block border-t-4 border-primary border-solid rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <Topbar toggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="pb-5 border-b border-neutral-200 mb-6 flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-600">Dashboard</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="flex space-x-3">
                <Select
                  defaultValue={timeRange}
                  onValueChange={(value) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-full pl-3 pr-10 py-2 text-base border-neutral-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last7days">Last 7 days</SelectItem>
                      <SelectItem value="last30days">Last 30 days</SelectItem>
                      <SelectItem value="thismonth">This month</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button 
                  variant="default" 
                  size="sm"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
                >
                  <i className="ri-download-line mr-2"></i>
                  Export
                </Button>
              </div>
            </div>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <DashboardCard
              title="Active Employees"
              value={stats?.activeEmployees || 0}
              changeText={`${stats?.activeEmployees || 0} today`}
              isPositive={true}
              icon="ri-user-follow-line"
              iconBgClass="bg-primary-light"
              iconTextClass="text-primary"
            />
            <DashboardCard
              title="Off-Site Employees"
              value={stats?.offSiteEmployees || 0}
              changeText={`${stats?.offSiteEmployees || 0} today`}
              isPositive={false}
              icon="ri-user-unfollow-line"
              iconBgClass="bg-error-light"
              iconTextClass="text-error"
            />
            <DashboardCard
              title="Active Work Sites"
              value={stats?.activeWorksites || 0}
              icon="ri-map-pin-line"
              iconBgClass="bg-secondary-light"
              iconTextClass="text-secondary"
            />
            <DashboardCard
              title="Pending Verifications"
              value={stats?.pendingVerifications || 0}
              icon="ri-time-line"
              iconBgClass="bg-accent-light"
              iconTextClass="text-accent"
            />
          </div>
          
          {/* Location Map and Employee Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Map View */}
            <EmployeeMap 
              employees={formatEmployeeLocations()} 
              worksites={worksites || []} 
            />
            
            {/* Activity List */}
            <ActivityList 
              activities={formatActivities()} 
              onViewAll={() => handleViewAll("activities")} 
            />
          </div>
          
          {/* Verification Images and Worksites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Verification Images */}
            <VerificationImages 
              images={formatVerificationImages()} 
              onViewAll={() => handleViewAll("images")} 
              onAddImage={handleAddImage} 
            />
            
            {/* Active Work Sites */}
            <WorksitesList 
              worksites={formatWorksites()} 
              onAddSite={handleAddSite} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
