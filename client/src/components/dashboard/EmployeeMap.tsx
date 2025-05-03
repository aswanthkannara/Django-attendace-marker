import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Define the structure of employee location data
interface EmployeeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  isOnsite: boolean;
  worksiteName: string;
}

interface EmployeeMapProps {
  employees: EmployeeLocation[];
  worksites: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }>;
}

export function EmployeeMap({ employees, worksites }: EmployeeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([40.7128, -74.0060], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add worksite circles
    worksites.forEach(worksite => {
      L.circle([worksite.latitude, worksite.longitude], {
        radius: worksite.radius,
        color: "#107C10",
        fillColor: "#107C10",
        fillOpacity: 0.1,
        weight: 1
      }).addTo(map);
    });

    // Add employee markers
    employees.forEach(employee => {
      // Create custom icon based on employee status
      const iconUrl = employee.isOnsite 
        ? "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/icons/Map/map-pin-fill.svg" 
        : "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/icons/Map/map-pin-fill.svg";

      const customIcon = L.divIcon({
        className: "relative",
        html: `
          <i class="ri-map-pin-fill text-primary text-2xl"></i>
          <span class="absolute top-0 right-0 h-3 w-3 rounded-full ${employee.isOnsite ? 'bg-secondary' : 'bg-error'} border-2 border-white"></span>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      L.marker([employee.latitude, employee.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <b>${employee.name}</b><br>
          Location: ${employee.worksiteName}<br>
          Status: ${employee.isOnsite ? 'On-site' : 'Off-site'}
        `);
    });

    // If there are employees, fit the map to show all of them
    if (employees.length > 0) {
      const bounds = L.latLngBounds(employees.map(e => [e.latitude, e.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup function, nothing to do here as we don't want to destroy the map
    };
  }, [employees, worksites]);

  // Handle view mode changes
  const handleViewModeChange = (mode: string) => {
    console.log(`Changed view mode to: ${mode}`);
    // Implementation for different view modes would go here
  };

  return (
    <Card className="bg-white shadow rounded-lg col-span-2">
      <CardHeader className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-neutral-600">Employee Locations</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="inline-flex items-center px-3 py-1.5 border border-neutral-200 text-sm font-medium rounded-md text-neutral-600 bg-white hover:bg-neutral-50 focus:outline-none"
            onClick={() => handleViewModeChange('map')}
          >
            <i className="ri-map-line mr-1.5"></i>
            Map
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="inline-flex items-center px-3 py-1.5 border border-neutral-200 text-sm font-medium rounded-md text-neutral-600 bg-white hover:bg-neutral-50 focus:outline-none"
            onClick={() => handleViewModeChange('list')}
          >
            <i className="ri-list-check-2 mr-1.5"></i>
            List
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="inline-flex items-center px-3 py-1.5 border border-neutral-200 text-sm font-medium rounded-md text-neutral-600 bg-white hover:bg-neutral-50 focus:outline-none"
            onClick={() => handleViewModeChange('filter')}
          >
            <i className="ri-filter-3-line mr-1.5"></i>
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded shadow-md p-2">
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 rounded-full bg-secondary mr-2"></span>
            <span className="text-xs text-neutral-600">On-site</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-error mr-2"></span>
            <span className="text-xs text-neutral-600">Off-site</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
