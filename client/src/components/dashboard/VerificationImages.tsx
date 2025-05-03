import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VerificationImage {
  id: number;
  userId: number;
  userName: string;
  locationName: string;
  timestamp: string | Date;
  imageData: string;
}

interface VerificationImagesProps {
  images: VerificationImage[];
  onViewAll: () => void;
  onAddImage: () => void;
}

export function VerificationImages({ images, onViewAll, onAddImage }: VerificationImagesProps) {
  // Format timestamp to "hh:mm a - Location" format
  const formatTimestamp = (timestamp: string | Date, location: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${ampm} - ${location}`;
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-neutral-600">Recent Verifications</CardTitle>
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
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <AspectRatio ratio={1 / 1} className="rounded-lg overflow-hidden bg-neutral-200">
                <img 
                  src={image.imageData} 
                  alt={`Verification for ${image.userName}`} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black opacity-0 group-hover:opacity-75 transition-opacity">
                <div className="p-2 text-white text-xs w-full">
                  <p className="font-medium truncate">{image.userName}</p>
                  <p className="text-gray-300 text-xs">{formatTimestamp(image.timestamp, image.locationName)}</p>
                </div>
              </div>
            </div>
          ))}
          <div 
            className="border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center h-full aspect-square"
            onClick={onAddImage}
          >
            <Button variant="ghost" className="text-neutral-400 hover:text-neutral-500">
              <i className="ri-image-add-line text-3xl"></i>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
