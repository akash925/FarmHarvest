import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Star, 
  Calendar,
  Users,
  Droplets,
  Sun,
  Ruler,
  MessageCircle,
  ShoppingCart,
  Camera,
  Video,
  Edit3
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SellerProfileData {
  user: {
    id: number;
    name: string;
    email: string;
    image: string;
    zip: string;
    about: string;
  };
  profile?: {
    farmName: string;
    bio: string;
    address: string;
    locationVisibility: string;
    phone: string;
    contactVisibility: string;
    operationalHours: {
      days: string[];
      hours: string;
    };
  };
  media: Array<{
    id: number;
    mediaType: 'photo' | 'video';
    url: string;
    caption: string;
  }>;
  farmSpaces: Array<{
    id: number;
    squareFootage: number;
    soilType: string;
    lightConditions: string;
    irrigationOptions: string;
    managementLevel: string;
    price: number;
    pricingType: string;
    status: string;
    additionalNotes: string;
  }>;
  listings: Array<{
    id: number;
    title: string;
    price: number;
    image: string;
    category: string;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export default function EnhancedSellerProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: sellerData, isLoading } = useQuery<SellerProfileData>({
    queryKey: ['/api/sellers', id, 'enhanced'],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h1>
          <p className="text-gray-600">The seller profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { user, profile, media, farmSpaces, listings, reviews } = sellerData;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <>
      <Helmet>
        <title>{profile?.farmName || user.name} - Seller Profile | FarmDirect</title>
        <meta 
          name="description" 
          content={`Browse ${profile?.farmName || user.name}'s fresh produce and farm spaces. ${profile?.bio || user.about}`} 
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile?.farmName || user.name}
                    </h1>
                    {profile?.farmName && (
                      <p className="text-lg text-gray-600 mt-1">by {user.name}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.zip}</span>
                      </div>
                      
                      {averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{listings.length} active listings</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Contact Seller
                    </Button>
                    <Button className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      View Products
                    </Button>
                  </div>
                </div>
                
                {profile?.bio && (
                  <p className="text-gray-700 mt-4 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        {media.length > 0 && (
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Farm Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {item.mediaType === 'photo' ? (
                      <img 
                        src={item.url} 
                        alt={item.caption || 'Farm photo'} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {item.mediaType === 'video' && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products ({listings.length})</TabsTrigger>
              <TabsTrigger value="farm-spaces">Farm Spaces ({farmSpaces.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Farm Information */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Farm Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile?.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-gray-600">
                              {profile.locationVisibility === 'full' ? profile.address : 
                               profile.locationVisibility === 'area' ? `${user.zip} area` : 
                               `${user.zip}`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {profile?.operationalHours && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Operating Hours</p>
                            <p className="text-gray-600">
                              {profile.operationalHours.days?.join(', ')} - {profile.operationalHours.hours}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {user.about && (
                        <div>
                          <p className="font-medium mb-2">About</p>
                          <p className="text-gray-700 leading-relaxed">{user.about}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile?.contactVisibility === 'email' || profile?.contactVisibility === 'both' ? (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                      ) : null}
                      
                      {profile?.phone && (profile?.contactVisibility === 'phone' || profile?.contactVisibility === 'both') && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{profile.phone}</span>
                        </div>
                      )}
                      
                      <Button className="w-full">
                        Send Message
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gray-100">
                        <img 
                          src={listing.image} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{listing.title}</h3>
                          <Badge variant="secondary">{listing.category}</Badge>
                        </div>
                        <p className="text-2xl font-bold text-primary">${(listing.price / 100).toFixed(2)}</p>
                        <Button className="w-full mt-3">View Details</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="farm-spaces" className="space-y-6">
                {farmSpaces.length > 0 ? (
                  <div className="grid gap-6">
                    {farmSpaces.map((space) => (
                      <Card key={space.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>Farm Space Available</CardTitle>
                            <Badge variant={space.status === 'available' ? 'default' : 'secondary'}>
                              {space.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Ruler className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Size</p>
                                <p className="font-medium">{space.squareFootage} sq ft</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Light</p>
                                <p className="font-medium">{space.lightConditions}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Irrigation</p>
                                <p className="font-medium">{space.irrigationOptions}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Management</p>
                                <p className="font-medium">{space.managementLevel}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Soil Type</p>
                            <p className="font-medium">{space.soilType}</p>
                          </div>
                          
                          {space.additionalNotes && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                              <p className="text-gray-700">{space.additionalNotes}</p>
                            </div>
                          )}
                          
                          <Separator />
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-2xl font-bold text-primary">
                                ${(space.price / 100).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">per {space.pricingType}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline">
                                Inquire for More Info
                              </Button>
                              <Button>
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Farm Spaces Available</h3>
                      <p className="text-gray-600">This seller doesn't currently have any farm spaces available for sharing.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>R</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600">This seller hasn't received any reviews yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}