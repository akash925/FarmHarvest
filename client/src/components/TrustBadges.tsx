import { Badge } from "@/components/ui/badge";
import { Shield, Star, Clock, MapPin, Award, CheckCircle } from "lucide-react";

interface TrustBadgesProps {
  verified: boolean;
  yearsActive: number;
  responseTime: string;
  rating: number;
  totalOrders: number;
  location: string;
}

export default function TrustBadges({
  verified,
  yearsActive,
  responseTime,
  rating,
  totalOrders,
  location
}: TrustBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {verified && (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          Verified Seller
        </Badge>
      )}
      
      {rating > 0 && (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Star className="h-3 w-3 mr-1" />
          {rating.toFixed(1)} Rating
        </Badge>
      )}
      
      {yearsActive > 0 && (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Award className="h-3 w-3 mr-1" />
          {yearsActive} Years Active
        </Badge>
      )}
      
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <Clock className="h-3 w-3 mr-1" />
        {responseTime}
      </Badge>
      
      {totalOrders > 10 && (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {totalOrders}+ Orders
        </Badge>
      )}
      
      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
        <MapPin className="h-3 w-3 mr-1" />
        {location}
      </Badge>
    </div>
  );
}