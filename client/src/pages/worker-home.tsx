import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WorkerHome() {
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

  // Handle check-in
  const handleCheckIn = () => {
    setLocation("/check-in");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block border-t-4 border-primary border-solid rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-primary text-3xl font-bold mb-2">WorkTrack</h1>
          <p className="text-neutral-500">Employee Check-In System</p>
        </div>
        
        <Card className="shadow-lg mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                {user?.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user?.fullName || ''} />
                ) : (
                  <AvatarFallback className="text-lg bg-primary text-white">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardTitle className="text-2xl">Welcome, {user.fullName}</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-neutral-700 mb-2">Ready to check in?</h2>
                <p className="text-neutral-500 mb-6">
                  Tap the button below to check in to your work location. 
                  Your location will be recorded and a verification photo is required.
                </p>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark text-lg py-6"
                  onClick={handleCheckIn}
                >
                  <i className="ri-camera-line mr-3 text-xl"></i>
                  Check In Now
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-neutral-500"
            >
              <i className="ri-logout-box-line mr-2"></i>
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-neutral-400">
          <p>If you need assistance, please contact your supervisor.</p>
        </div>
      </div>
    </div>
  );
}