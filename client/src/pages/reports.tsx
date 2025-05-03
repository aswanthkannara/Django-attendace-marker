import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Reports() {
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [reportType, setReportType] = useState("attendance");
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  // Mock data for the charts
  const attendanceData = [
    { day: "Mon", onsite: 18, offsite: 4, absent: 2 },
    { day: "Tue", onsite: 20, offsite: 3, absent: 1 },
    { day: "Wed", onsite: 19, offsite: 5, absent: 0 },
    { day: "Thu", onsite: 17, offsite: 6, absent: 1 },
    { day: "Fri", onsite: 16, offsite: 4, absent: 4 },
    { day: "Sat", onsite: 10, offsite: 2, absent: 0 },
    { day: "Sun", onsite: 8, offsite: 1, absent: 0 },
  ];

  const worksiteData = [
    { name: "Main Construction Site", employees: 12 },
    { name: "Downtown Project", employees: 8 },
    { name: "Riverside Construction", employees: 6 },
    { name: "North Site", employees: 4 },
    { name: "East End Project", employees: 2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <Topbar toggleSidebar={() => {}} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="pb-5 border-b border-neutral-200 mb-6 flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-600">Reports</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="flex space-x-3">
                <Select
                  defaultValue={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger className="w-40 border-neutral-200">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="worksites">Worksites</SelectItem>
                      <SelectItem value="verifications">Verifications</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  defaultValue={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-40 border-neutral-200">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
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
          
          {/* Report Charts */}
          <div className="space-y-6">
            {reportType === "attendance" && (
              <Card className="bg-white shadow rounded-lg">
                <CardHeader className="p-4 border-b border-neutral-200">
                  <CardTitle className="text-lg font-medium text-neutral-600">Weekly Attendance Report</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={attendanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="onsite" name="On-site" fill="#107C10" />
                        <Bar dataKey="offsite" name="Off-site" fill="#D13438" />
                        <Bar dataKey="absent" name="Absent" fill="#605E5C" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {reportType === "worksites" && (
              <Card className="bg-white shadow rounded-lg">
                <CardHeader className="p-4 border-b border-neutral-200">
                  <CardTitle className="text-lg font-medium text-neutral-600">Worksite Occupancy</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={worksiteData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="employees" name="Employees" fill="#0078D4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {reportType === "verifications" && (
              <Card className="bg-white shadow rounded-lg">
                <CardHeader className="p-4 border-b border-neutral-200">
                  <CardTitle className="text-lg font-medium text-neutral-600">Verification Status Report</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <div className="p-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                      <i className="ri-file-chart-line text-3xl text-neutral-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-600 mb-2">Coming Soon</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">Detailed verification reports are coming soon. Check back for insights into verification success rates and trends.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
