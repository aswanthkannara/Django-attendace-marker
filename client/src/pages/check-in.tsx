import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCamera } from "@/hooks/use-camera";
import { useGeolocation } from "@/hooks/use-geolocation";

// Create our form schema based on the CheckInRequest type
const formSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  worksiteId: z.string().min(1, { message: "Worksite is required" }),
});

export default function CheckIn() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const { toast } = useToast();
  
  // Fetch worksites
  const { data: worksites, isLoading: sitesLoading } = useQuery({
    queryKey: ["/api/worksites"],
    retry: false,
  });
  
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });
  
  // Initialize hooks for camera and geolocation
  const { videoRef, photo, error: cameraError, loading: cameraLoading, startCamera, stopCamera, takePhoto } = useCamera();
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      worksiteId: "",
    },
  });
  
  // Handle camera activation
  const handleActivateCamera = async () => {
    setCameraActive(true);
    await startCamera();
  };
  
  // Handle camera deactivation
  const handleDeactivateCamera = () => {
    setCameraActive(false);
    stopCamera();
  };
  
  // Handle photo capture
  const handleCapture = () => {
    takePhoto();
  };
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!latitude || !longitude) {
      toast({
        title: "Location error",
        description: "Unable to get your current location. Please ensure location services are enabled.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const checkInData = {
        userId: parseInt(values.userId),
        worksiteId: parseInt(values.worksiteId),
        latitude,
        longitude,
        imageData: photo || undefined,
      };
      
      const response = await apiRequest("POST", "/api/checkins", checkInData);
      const result = await response.json();
      
      toast({
        title: "Check-in successful",
        description: result.isOnsite 
          ? "You have been verified as on-site." 
          : "Your check-in was recorded, but you appear to be outside the worksite boundary.",
        variant: result.isOnsite ? "default" : "destructive",
      });
      
      // Go back to login page after successful check-in
      setTimeout(() => {
        handleDeactivateCamera();
        setLocation("/login");
      }, 2000);
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: error instanceof Error ? error.message : "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clean up camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  const loading = sitesLoading || usersLoading || locationLoading;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-primary text-3xl font-bold mb-2">WorkTrack</h1>
          <p className="text-neutral-500">Employee Check-In System</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Check In</CardTitle>
            <CardDescription className="text-center">
              Verify your presence at a work site
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block border-t-4 border-primary border-solid rounded-full w-8 h-8 animate-spin mb-4"></div>
                <p>Loading...</p>
              </div>
            ) : locationError ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
                <p className="font-medium">Location Error</p>
                <p className="text-sm">{locationError}</p>
                <Button 
                  variant="outline" 
                  className="mt-3" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users && users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="worksiteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Site</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work site" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {worksites && worksites.map((site: any) => (
                              <SelectItem key={site.id} value={site.id.toString()}>
                                {site.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Location</FormLabel>
                    <div className="flex space-x-2">
                      <Input 
                        value={latitude ? latitude.toFixed(6) : "Locating..."} 
                        disabled 
                        className="text-sm" 
                        placeholder="Latitude"
                      />
                      <Input 
                        value={longitude ? longitude.toFixed(6) : "Locating..."} 
                        disabled 
                        className="text-sm" 
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Verification Photo</FormLabel>
                    
                    {!cameraActive ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleActivateCamera}
                        disabled={isSubmitting}
                      >
                        <i className="ri-camera-line mr-2"></i>
                        Activate Camera
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden bg-black">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-64 object-cover"
                          />
                          
                          {cameraLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="inline-block border-t-4 border-white border-solid rounded-full w-8 h-8 animate-spin"></div>
                            </div>
                          )}
                          
                          {photo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img 
                                src={photo} 
                                alt="Captured" 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="bg-white/75 hover:bg-white z-10"
                                onClick={() => takePhoto()}
                              >
                                Take Again
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {!photo ? (
                            <Button 
                              type="button" 
                              className="flex-1" 
                              onClick={handleCapture}
                              disabled={cameraLoading}
                            >
                              <i className="ri-camera-line mr-2"></i>
                              Capture
                            </Button>
                          ) : (
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1" 
                              onClick={() => takePhoto()}
                            >
                              <i className="ri-refresh-line mr-2"></i>
                              Retake
                            </Button>
                          )}
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1" 
                            onClick={handleDeactivateCamera}
                          >
                            <i className="ri-close-line mr-2"></i>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {cameraError && (
                      <p className="text-sm text-red-500 mt-1">{cameraError}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark" 
                    disabled={isSubmitting || !latitude || !longitude}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Check In"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              onClick={() => setLocation("/login")}
              className="text-neutral-500"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
