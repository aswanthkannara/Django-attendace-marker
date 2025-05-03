import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

interface SidebarProps {
  user: Partial<User> | null;
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/location-tracking", label: "Location Tracking", icon: "ri-user-location-line" },
    { path: "/verification-images", label: "Verification Images", icon: "ri-camera-line" },
    { path: "/employees", label: "Employees", icon: "ri-team-line" },
    { path: "/reports", label: "Reports", icon: "ri-file-chart-line" },
    { path: "/settings", label: "Settings", icon: "ri-settings-3-line" },
  ];

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-neutral-200">
        {/* Logo Area */}
        <div className="flex items-center h-16 px-4 border-b border-neutral-200">
          <span className="text-primary text-2xl font-bold">WorkTrack</span>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center px-4 py-3 text-neutral-500 hover:bg-neutral-100 ${isActive(item.path) ? 'sidebar-active' : ''}`}>
                    <i className={`${item.icon} mr-3 text-xl`}></i>
                    <span className="font-medium">{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              {user?.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user?.fullName || 'User'} />
              ) : (
                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              )}
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-500">{user?.fullName || 'Guest'}</p>
              <p className="text-xs text-neutral-400">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-neutral-400 hover:text-neutral-500"
              onClick={onLogout}
            >
              <i className="ri-logout-box-r-line text-lg"></i>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
