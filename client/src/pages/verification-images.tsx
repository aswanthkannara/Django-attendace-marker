import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function VerificationImages() {
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch verification images
  const { data: verificationImages, isLoading } = useQuery({
    queryKey: ["/api/verification-images/recent?limit=20"],
    retry: false,
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    return format(new Date(timestamp), "MMM dd, yyyy 'at' h:mm a");
  };

  // Navigate to check-in page
  const handleAddImage = () => {
    setLocation("/check-in");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block border-t-4 border-primary border-solid rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading verification images...</p>
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
        <Topbar toggleSidebar={() => {}} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="pb-5 border-b border-neutral-200 mb-6 flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-600">Verification Images</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <Button 
                variant="default" 
                onClick={handleAddImage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
              >
                <i className="ri-camera-line mr-2"></i>
                Capture New Image
              </Button>
            </div>
          </div>
          
          {/* Verification Images Grid */}
          <Card className="bg-white shadow rounded-lg">
            <CardHeader className="p-4 border-b border-neutral-200">
              <CardTitle className="text-lg font-medium text-neutral-600">Recent Verification Images</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {verificationImages && verificationImages.length > 0 ? (
                  verificationImages.map((image: any) => (
                    <Card key={image.id} className="overflow-hidden">
                      <AspectRatio ratio={1 / 1} className="bg-neutral-200">
                        <img 
                          src={image.imageData} 
                          alt={`Verification for ${image.user?.fullName || "Unknown User"}`} 
                          className="object-cover"
                        />
                      </AspectRatio>
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <Avatar className="h-8 w-8 mr-2">
                            {image.user?.profileImage ? (
                              <AvatarImage src={image.user.profileImage} alt={image.user?.fullName || ""} />
                            ) : (
                              <AvatarFallback>{(image.user?.fullName || "?").charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="text-sm font-medium">{image.user?.fullName || "Unknown User"}</h3>
                            <p className="text-xs text-neutral-500">{image.worksite?.name || "Unknown Location"}</p>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500">{formatDateTime(image.timestamp)}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <Badge 
                            variant="outline" 
                            className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                          >
                            Verified
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 text-primary">
                            <i className="ri-eye-line mr-1"></i>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                      <i className="ri-image-line text-2xl text-neutral-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-600 mb-1">No verification images</h3>
                    <p className="text-neutral-500 mb-4">Start capturing verification images to see them here.</p>
                    <Button 
                      variant="default" 
                      onClick={handleAddImage}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
                    >
                      <i className="ri-camera-line mr-2"></i>
                      Capture First Image
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
