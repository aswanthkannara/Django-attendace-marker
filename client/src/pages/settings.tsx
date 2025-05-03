import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  // Handle form submissions
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleSavePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveGeneral = () => {
    toast({
      title: "Settings updated",
      description: "Your application settings have been saved.",
    });
  };

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
          <div className="pb-5 border-b border-neutral-200 mb-6">
            <h1 className="text-2xl font-semibold text-neutral-600">Settings</h1>
          </div>
          
          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 gap-4 mb-6">
              <TabsTrigger value="profile" className="px-4 py-2">Profile</TabsTrigger>
              <TabsTrigger value="security" className="px-4 py-2">Security</TabsTrigger>
              <TabsTrigger value="notifications" className="px-4 py-2">Notifications</TabsTrigger>
              <TabsTrigger value="general" className="px-4 py-2">General</TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start">
                    <div className="flex-shrink-0">
                      <div className="flex flex-col items-center space-y-2">
                        <Avatar className="h-24 w-24">
                          {user?.profileImage ? (
                            <AvatarImage src={user.profileImage} alt={user?.fullName || ''} />
                          ) : (
                            <AvatarFallback className="text-lg">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                          )}
                        </Avatar>
                        <Button variant="outline" size="sm" className="mt-2">
                          <i className="ri-upload-2-line mr-2"></i>
                          Change Photo
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" defaultValue={user?.fullName || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" defaultValue={user?.username || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user?.email || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input id="role" readOnly value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""} />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                    <Button onClick={handleSavePassword}>Update Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Login Sessions</h3>
                    <div className="space-y-2">
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Current Session</div>
                            <div className="text-sm text-neutral-500">Last activity: Just now</div>
                            <div className="text-xs text-neutral-400 mt-1">Chrome on Windows • IP: 192.168.1.1</div>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Active
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="destructive">Log Out All Other Devices</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailNewCheckins">New Check-ins</Label>
                            <p className="text-sm text-neutral-500">Receive emails when employees check in</p>
                          </div>
                          <Switch id="emailNewCheckins" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailOffsite">Off-site Alerts</Label>
                            <p className="text-sm text-neutral-500">Get notified when employees are outside their work zone</p>
                          </div>
                          <Switch id="emailOffsite" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailReports">Weekly Reports</Label>
                            <p className="text-sm text-neutral-500">Receive weekly summary reports</p>
                          </div>
                          <Switch id="emailReports" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">In-App Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="appNewCheckins">New Check-ins</Label>
                            <p className="text-sm text-neutral-500">Show notifications for new employee check-ins</p>
                          </div>
                          <Switch id="appNewCheckins" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="appVerification">Verification Requests</Label>
                            <p className="text-sm text-neutral-500">Get notified about pending verification requests</p>
                          </div>
                          <Switch id="appVerification" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure your application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Display</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="darkMode">Dark Mode</Label>
                            <p className="text-sm text-neutral-500">Toggle between light and dark themes</p>
                          </div>
                          <Switch id="darkMode" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Map Settings</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="defaultZoom">Default Zoom Level</Label>
                          <select 
                            id="defaultZoom" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="10">Low (Wide Area)</option>
                            <option value="13" selected>Medium</option>
                            <option value="16">High (Close-up)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mapType">Map Type</Label>
                          <select 
                            id="mapType" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option selected>Street Map</option>
                            <option>Satellite</option>
                            <option>Hybrid</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Location Tracking</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="highAccuracy">High Accuracy Mode</Label>
                            <p className="text-sm text-neutral-500">Use more battery power for more precise location tracking</p>
                          </div>
                          <Switch id="highAccuracy" defaultChecked />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="geofenceRadius">Default Geofence Radius (meters)</Label>
                          <Input id="geofenceRadius" type="number" defaultValue="100" />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleSaveGeneral}>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
