import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TopbarProps {
  toggleSidebar: () => void;
  onSearch?: (query: string) => void;
}

export function Topbar({ toggleSidebar, onSearch }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-neutral-500 hover:text-neutral-600 focus:outline-none"
            >
              <i className="ri-menu-line text-2xl"></i>
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xs mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-neutral-400"></i>
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-md leading-5 bg-neutral-100 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center">
            <div className="flex">
              <Button variant="ghost" size="icon" className="p-2 text-neutral-400 hover:text-neutral-500">
                <i className="ri-notification-3-line text-xl"></i>
              </Button>
              <Button variant="ghost" size="icon" className="p-2 text-neutral-400 hover:text-neutral-500">
                <i className="ri-question-line text-xl"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
