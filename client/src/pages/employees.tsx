import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch employees (users)
  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Fetch recent check-ins
  const { data: recentCheckins } = useQuery({
    queryKey: ["/api/checkins/recent?limit=50"],
    retry: false,
  });

  useEffect(() => {
    if (employees) {
      let filtered = [...employees];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((employee) => 
          (employee.fullName || "").toLowerCase().includes(query) ||
          (employee.email || "").toLowerCase().includes(query) ||
          (employee.username || "").toLowerCase().includes(query)
        );
      }
      
      setFilteredEmployees(filtered);
    }
  }, [employees, searchQuery]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Determine employee status based on check-ins
  const getEmployeeStatus = (employeeId: number) => {
    if (!recentCheckins) return "inactive";
    
    // Get today's date (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the most recent check-in for this employee
    const employeeCheckins = recentCheckins.filter((checkin: any) => checkin.userId === employeeId);
    
    if (employeeCheckins.length === 0) return "inactive";
    
    // Sort by timestamp (most recent first)
    employeeCheckins.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const mostRecent = employeeCheckins[0];
    const checkinDate = new Date(mostRecent.timestamp);
    
    // Check if the check-in was today
    if (checkinDate >= today) {
      return mostRecent.isOnsite ? "active" : "offsite";
    }
    
    return "inactive";
  };

  // Add new employee
  const handleAddEmployee = () => {
    toast({
      title: "Not Implemented",
      description: "This feature is coming soon!",
      variant: "default",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block border-t-4 border-primary border-solid rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading employee data...</p>
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
            <h1 className="text-2xl font-semibold text-neutral-600">Employees</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <Button 
                variant="default" 
                onClick={handleAddEmployee}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
              >
                <i className="ri-user-add-line mr-2"></i>
                Add Employee
              </Button>
            </div>
          </div>
          
          {/* Employees List */}
          <Card className="bg-white shadow rounded-lg">
            <CardHeader className="p-4 border-b border-neutral-200">
              <CardTitle className="text-lg font-medium text-neutral-600">All Employees</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="text-xs font-medium text-neutral-500 bg-neutral-100 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left">Employee</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredEmployees && filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee: any) => (
                        <tr key={employee.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                {employee.profileImage ? (
                                  <AvatarImage src={employee.profileImage} alt={employee.fullName || ""} />
                                ) : (
                                  <AvatarFallback>{(employee.fullName || "?").charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-sm font-medium text-neutral-600">{employee.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{employee.email}</td>
                          <td className="px-4 py-3 text-sm text-neutral-500">
                            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {(() => {
                              const status = getEmployeeStatus(employee.id);
                              switch (status) {
                                case "active":
                                  return (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                      <i className="ri-checkbox-circle-fill mr-1"></i>
                                      Active
                                    </Badge>
                                  );
                                case "offsite":
                                  return (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                                      <i className="ri-error-warning-fill mr-1"></i>
                                      Off-site
                                    </Badge>
                                  );
                                default:
                                  return (
                                    <Badge variant="outline" className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100 border-neutral-200">
                                      <i className="ri-time-line mr-1"></i>
                                      Inactive
                                    </Badge>
                                  );
                              }
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <Button variant="ghost" size="sm" className="text-primary mr-2">
                              <i className="ri-eye-line mr-1"></i>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="text-neutral-500">
                              <i className="ri-edit-line mr-1"></i>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                          No employees found
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
