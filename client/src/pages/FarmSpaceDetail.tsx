import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Square, 
  Droplets, 
  Sun, 
  Wrench, 
  Home, 
  Calendar,
  ArrowLeft,
  Star,
  User
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface FarmSpace {
  id: number;
  title: string;
  description: string;
  sizeSqft: number;
  pricePerMonth: number;
  soilType: string;
  lightConditions: string;
  waterAccess: boolean;
  greenhouseAccess: boolean;
  toolStorage: boolean;
  location: string;
  availableFrom: string;
  availableUntil?: string;
  sellerProfileId: number;
}

interface SellerProfile {
  id: number;
  name: string;
  image?: string;
  about?: string;
  averageRating?: number;
  totalReviews?: number;
}

export default function FarmSpaceDetail() {
  const { id } = useParams();

  const { data: farmSpace, isLoading } = useQuery({
    queryKey: ['/api/farm-spaces', id],
    queryFn: async () => {
      const response = await fetch(`/api/farm-spaces/${id}`);
      if (!response.ok) throw new Error('Failed to fetch farm space');
      return response.json();
    }
  });

  const { data: sellerData } = useQuery({
    queryKey: ['/api/users', farmSpace?.sellerProfileId],
    queryFn: async () => {
      if (!farmSpace?.sellerProfileId) return null;
      const response = await fetch(`/api/users/${farmSpace.sellerProfileId}`);
      if (!response.ok) throw new Error('Failed to fetch seller');
      return response.json();
    },
    enabled: !!farmSpace?.sellerProfileId
  });

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const formatSoilType = (soilType: string | null) => {
    if (!soilType) return 'Unknown';
    return soilType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatLightConditions = (light: string | null) => {
    if (!light) return 'Unknown';
    return light.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!farmSpace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Farm Space Not Found</h1>
          <Link href="/farm-spaces">
            <Button>Back to Farm Spaces</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{farmSpace.title} | FarmDirect</title>
        <meta
          name="description"
          content={`Rent ${farmSpace.title} - ${farmSpace.sizeSqft} sq ft farm space with ${formatSoilType(farmSpace.soilType)} soil and ${formatLightConditions(farmSpace.lightConditions)} light conditions.`}
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link href="/farm-spaces">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farm Spaces
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-display font-bold text-slate-900">
                  {farmSpace.title}
                </h1>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatPrice(farmSpace.pricePerMonth)}/month
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-slate-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                {farmSpace.location}
              </div>
            </div>

            {/* Photo Placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="h-64 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Home className="h-12 w-12 mx-auto mb-2" />
                    <p>Farm Space Photo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Space</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">
                  {farmSpace.description}
                </p>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Space Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Square className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                    <div className="text-sm text-slate-600 mb-1">Size</div>
                    <div className="font-semibold">{farmSpace.sizeSqft} sq ft</div>
                  </div>
                  
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Sun className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                    <div className="text-sm text-slate-600 mb-1">Light</div>
                    <div className="font-semibold">{formatLightConditions(farmSpace.lightConditions)}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                    <div className="text-sm text-slate-600 mb-1">Available</div>
                    <div className="font-semibold">{formatDate(farmSpace.availableFrom)}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="h-6 w-6 mx-auto mb-2 bg-amber-600 rounded-full"></div>
                    <div className="text-sm text-slate-600 mb-1">Soil</div>
                    <div className="font-semibold">{formatSoilType(farmSpace.soilType)}</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmSpace.waterAccess && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Droplets className="h-3 w-3 mr-1" />
                        Water Access
                      </Badge>
                    )}
                    {farmSpace.greenhouseAccess && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Home className="h-3 w-3 mr-1" />
                        Greenhouse Access
                      </Badge>
                    )}
                    {farmSpace.toolStorage && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <Wrench className="h-3 w-3 mr-1" />
                        Tool Storage
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sellerData?.user && (
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={sellerData.user.image} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{sellerData.user.name}</div>
                      <div className="text-sm text-slate-600">Property Owner</div>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <Link href={`/farm-spaces/${id}/message`}>
                  <Button className="w-full" size="lg">
                    Send Message
                  </Button>
                </Link>
                
                <Link href={`/users/${farmSpace.sellerProfileId}`}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Map View</p>
                    <p className="text-xs">{farmSpace.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}