import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Star, Clock, Award, MapPin } from "lucide-react";

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
  const badges = [];

  if (verified) {
    badges.push({
      icon: <Shield className="h-3 w-3" />,
      label: "Verified Seller",
      color: "bg-green-100 text-green-800",
      description: "Identity and farm location verified"
    });
  }

  if (yearsActive >= 2) {
    badges.push({
      icon: <Award className="h-3 w-3" />,
      label: `${yearsActive}+ Years`,
      color: "bg-blue-100 text-blue-800",
      description: "Established seller with experience"
    });
  }

  if (rating >= 4.5) {
    badges.push({
      icon: <Star className="h-3 w-3" />,
      label: "Top Rated",
      color: "bg-yellow-100 text-yellow-800",
      description: "Highly rated by customers"
    });
  }

  if (responseTime.includes("1 hour") || responseTime.includes("30 min")) {
    badges.push({
      icon: <Clock className="h-3 w-3" />,
      label: "Quick Response",
      color: "bg-purple-100 text-purple-800",
      description: "Responds quickly to messages"
    });
  }

  if (totalOrders >= 50) {
    badges.push({
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Trusted Seller",
      color: "bg-indigo-100 text-indigo-800",
      description: "Many successful transactions"
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Badge key={index} className={`${badge.color} border-0`} title={badge.description}>
          {badge.icon}
          <span className="ml-1">{badge.label}</span>
        </Badge>
      ))}
      <Badge variant="outline" className="text-gray-600">
        <MapPin className="h-3 w-3 mr-1" />
        {location}
      </Badge>
    </div>
  );
}