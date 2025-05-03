import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { EmployeeMap } from "@/components/dashboard/EmployeeMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function LocationTracking() {
  const [user, setUser] = useState<any>(null);
  const [filteredCheckins, setFilteredCheckins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWorksite, setFilterWorksite] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch check-ins
  const { data: checkins, isLoading: checkinsLoading } = useQuery({
    queryKey: ["/api/checkins/recent?limit=50"],
    retry: false,
  });

  // Fetch worksites
  const { data: worksites, isLoading: worksitesLoading } = useQuery({
    queryKey: ["/api/worksites"],
    retry: false,
  });

  useEffect(() => {
    if (checkins) {
      let filtered = [...checkins];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((checkin) => 
          (checkin.user?.fullName || "").toLowerCase().includes(query) ||
          (checkin.worksite?.name || "").toLowerCase().includes(query)
        );
      }
      
      // Apply worksite filter
      if (filterWorksite !== "all") {
        filtered = filtered.filter((checkin) => 
          checkin.worksiteId.toString() === filterWorksite
        );
      }
      
      // Apply status filter
      if (filterStatus !== "all") {
        filtered = filtered.filter((checkin) => 
          checkin.isOnsite === (filterStatus === "onsite")
        );
      }
      
      setFilteredCheckins(filtered);
    }
  }, [checkins, searchQuery, filterWorksite, filterStatus]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Format employee location data for the map
  const formatEmployeeLocations = () => {
    if (!filteredCheckins || filteredCheckins.length === 0) {
      return [];
    }

    // Filter to unique employees (take the most recent check-in)
    const employeeMap = new Map();
    filteredCheckins.forEach((checkin: any) => {
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

  // Format timestamp to "HH:mm AM/PM" format
  const formatTime = (timestamp: string | Date) => {
    return format(new Date(timestamp), "hh:mm a");
  };

  // Format date to "MMM dd, yyyy" format
  const formatDate = (timestamp: string | Date) => {
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  // Show loading state
  if (checkinsLoading || worksitesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block border-t-4 border-primary border-solid rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading location data...</p>
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
        <Topbar toggleSidebar={() => {}} onSearch={handleSearch} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="pb-5 border-b border-neutral-200 mb-6 flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-600">Location Tracking</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="flex space-x-3">
                <Select
                  defaultValue={filterWorksite}
                  onValueChange={setFilterWorksite}
                >
                  <SelectTrigger className="w-40 border-neutral-200">
                    <SelectValue placeholder="All Worksites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Worksites</SelectItem>
                      {worksites && worksites.map((site: any) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  defaultValue={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-40 border-neutral-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="offsite">Off-site</SelectItem>
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
          
          {/* Map */}
          <div className="mb-6">
            <EmployeeMap 
              employees={formatEmployeeLocations()} 
              worksites={worksites || []} 
            />
          </div>
          
          {/* Check-ins List */}
          <Card className="bg-white shadow rounded-lg">
            <CardHeader className="p-4 border-b border-neutral-200">
              <CardTitle className="text-lg font-medium text-neutral-600">Employee Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="text-xs font-medium text-neutral-500 bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left">Employee</th>
                      <th className="px-4 py-3 text-left">Work Site</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredCheckins && filteredCheckins.length > 0 ? (
                      filteredCheckins.map((checkin: any) => (
                        <tr key={checkin.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                {checkin.user?.profileImage ? (
                                  <AvatarImage src={checkin.user.profileImage} alt={checkin.user?.fullName || ""} />
                                ) : (
                                  <AvatarFallback>{(checkin.user?.fullName || "?").charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-sm font-medium text-neutral-600">{checkin.user?.fullName || "Unknown User"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{checkin.worksite?.name || "Unknown Location"}</td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(checkin.timestamp)}</td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{formatTime(checkin.timestamp)}</td>
                          <td className="px-4 py-3 text-sm">
                            {checkin.isOnsite ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <i className="ri-check-line mr-1"></i>
                                On-site
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <i className="ri-close-line mr-1"></i>
                                Off-site
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <Button variant="ghost" size="sm" className="text-primary">
                              <i className="ri-eye-line mr-1"></i>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                          No check-ins found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
