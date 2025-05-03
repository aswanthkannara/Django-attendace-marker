import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Activity {
  id: number;
  userId: number;
  userName: string;
  profileImage?: string;
  locationName: string;
  timestamp: string | Date;
  status: "verified" | "pending" | "rejected";
}

interface ActivityListProps {
  activities: Activity[];
  onViewAll: () => void;
}

export function ActivityList({ activities, onViewAll }: ActivityListProps) {
  // Format timestamp to "HH:mm AM/PM" format
  const formatTime = (timestamp: string | Date) => {
    return format(new Date(timestamp), "hh:mm a");
  };

  // Render the status badge based on the status value
  const renderStatusBadge = (status: Activity["status"]) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <i className="ri-check-line mr-1"></i>
            Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            <i className="ri-time-line mr-1"></i>
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            <i className="ri-error-warning-line mr-1"></i>
            Location mismatch
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-neutral-600">Today's Activity</CardTitle>
        <Button 
          variant="link" 
          size="sm" 
          onClick={onViewAll} 
          className="inline-flex items-center px-2.5 py-1.5 text-sm text-primary hover:text-primary-dark"
        >
          View all
          <i className="ri-arrow-right-line ml-1"></i>
        </Button>
      </CardHeader>
      <ul className="divide-y divide-neutral-200 overflow-y-auto" style={{ maxHeight: "432px" }}>
        {activities.map((activity) => (
          <li key={activity.id} className="p-4 hover:bg-neutral-50">
            <div className="flex">
              <Avatar className="h-10 w-10">
                {activity.profileImage ? (
                  <AvatarImage src={activity.profileImage} alt={activity.userName} />
                ) : (
                  <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600">{activity.userName}</p>
                  <p className="text-xs text-neutral-400">{formatTime(activity.timestamp)}</p>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">Checked in at {activity.locationName}</p>
                <div className="mt-1.5 flex">
                  {renderStatusBadge(activity.status)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
