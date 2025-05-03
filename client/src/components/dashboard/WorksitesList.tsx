import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Worksite {
  id: number;
  name: string;
  address: string;
  activeEmployees: number;
}

interface WorksitesListProps {
  worksites: Worksite[];
  onAddSite: () => void;
}

export function WorksitesList({ worksites, onAddSite }: WorksitesListProps) {
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-neutral-600">Active Work Sites</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSite}
          className="inline-flex items-center px-3 py-1.5 border border-primary text-sm font-medium rounded-md text-primary bg-white hover:bg-primary hover:text-white focus:outline-none"
        >
          <i className="ri-add-line mr-1.5"></i>
          Add Site
        </Button>
      </CardHeader>
      <ul className="divide-y divide-neutral-200">
        {worksites.map((site) => (
          <li key={site.id} className="p-4 hover:bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-md bg-primary-light bg-opacity-10 flex items-center justify-center">
                    <i className="ri-building-line text-primary text-xl"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-neutral-600">{site.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{site.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  {site.activeEmployees} active
                </span>
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-500">
                  <i className="ri-more-2-fill"></i>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
