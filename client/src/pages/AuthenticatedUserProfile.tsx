import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Calendar, Mail, Package, Star, MessageCircle, 
  Edit, Phone, Globe, Award, TrendingUp, Users
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import TrustBadges from "@/components/TrustBadges";

interface UserProfileProps {
  userId: number;
}

export default function AuthenticatedUserProfile({ userId }: UserProfileProps) {
  const [, navigate] = useLocation();

  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    }
  });

  const { data: listingsData } = useQuery({
    queryKey: [`/api/listings/user/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/listings/user/${userId}`);
      return response.json();
    }
  });

  const { data: reviewsData } = useQuery({
    queryKey: [`/api/reviews/seller/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/seller/${userId}`);
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const user = userData?.user;
  const listings = listingsData?.listings || [];
  const reviews = reviewsData?.reviews || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              User not found
            </h3>
            <p className="text-gray-500 mb-4">
              The user profile you're looking for doesn't exist
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

  const totalSales = listings.reduce((sum: number, listing: any) => sum + (listing.soldQuantity || 0), 0);
  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{user.name} - FarmDirect Farmer Profile</title>
        <meta name="description" content={`${user.name}'s farmer profile on FarmDirect. ${user.about || 'Local farmer providing fresh produce.'}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-3xl">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {user.name || 'Local Farmer'}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{user.zip ? `Santa Monica, CA ${user.zip}` : 'Location not specified'}</span>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/messages`)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>

                  <TrustBadges
                    verified={true}
                    yearsActive={new Date().getFullYear() - memberSince}
                    responseTime="Usually responds in 2 hours"
                    rating={averageRating}
                    totalOrders={totalSales}
                    location={user.zip ? `CA ${user.zip}` : 'California'}
                  />

                  {user.about && (
                    <p className="text-gray-700 mt-4 leading-relaxed">
                      {user.about}
                    </p>
                  )}

                  {user.productsGrown && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Specializes in:</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.productsGrown.split(',').map((product: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-green-700 border-green-200">
                            {product.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
                  <div className="text-sm text-gray-600">Active Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{memberSince}</div>
                  <div className="text-sm text-gray-600">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings">Products ({listings.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>Available Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {listings.map((listing: any) => (
                        <div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            {listing.imageUrl ? (
                              <img
                                src={listing.imageUrl}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-16 w-16 text-gray-400" />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold mb-2">{listing.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {listing.description || 'Fresh, locally grown produce'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-green-600">
                                ${listing.price}
                              </span>
                              <Badge variant="outline">
                                {listing.quantity} {listing.unit}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No products listed yet
                      </h3>
                      <p className="text-gray-500">
                        This farmer hasn't added any products to sell yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-gray-500">
                        This farmer hasn't received any reviews yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About {user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Member since {memberSince}</span>
                        </div>
                      </div>
                    </div>

                    {user.about && (
                      <div>
                        <h3 className="font-semibold mb-3">Farm Story</h3>
                        <p className="text-gray-700 leading-relaxed">{user.about}</p>
                      </div>
                    )}

                    {user.productsGrown && (
                      <div>
                        <h3 className="font-semibold mb-3">What We Grow</h3>
                        <p className="text-gray-700">{user.productsGrown}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}