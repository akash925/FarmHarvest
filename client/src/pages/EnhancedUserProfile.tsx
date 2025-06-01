import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Star, Clock, Phone, Mail, Calendar, 
  Package, Users, Award, Shield, MessageCircle 
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import TrustBadges from "@/components/TrustBadges";

export default function EnhancedUserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const userId = parseInt(id || "1");

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: listingsData } = useQuery({
    queryKey: [`/api/listings/user/${userId}`],
  });

  const { data: reviewsData } = useQuery({
    queryKey: [`/api/reviews/seller/${userId}`],
  });

  const { data: sellerProfileData } = useQuery({
    queryKey: [`/api/seller-profiles/${userId}`],
  });

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const user = userData?.user;
  const listings = listingsData?.listings || [];
  const reviews = reviewsData?.reviews || [];
  const sellerProfile = sellerProfileData?.profile;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              User not found
            </h3>
            <p className="text-gray-500">
              The user profile you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const joinDate = new Date(user.createdAt).getFullYear();
  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{user.name || 'User Profile'} - FarmDirect</title>
        <meta name="description" content={`View ${user.name || 'user'}'s profile, listings, and reviews on FarmDirect marketplace.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col items-center lg:items-start">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-4xl">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {!isOwnProfile && (
                    <div className="flex gap-2">
                      <Button size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {user.name || 'User Profile'}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {joinDate}
                        </span>
                        {user.zip && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {user.zip}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mb-6">
                    <TrustBadges
                      verified={true}
                      yearsActive={new Date().getFullYear() - joinDate}
                      responseTime="Usually responds in 2 hours"
                      rating={averageRating}
                      totalOrders={listings.length * 5} // Estimated based on listings
                      location={user.zip || "Location not specified"}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
                      <div className="text-sm text-gray-600">Active Listings</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                      </div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{reviews.length}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {new Date().getFullYear() - joinDate}
                      </div>
                      <div className="text-sm text-gray-600">Years Active</div>
                    </div>
                  </div>

                  {user.about && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600">{user.about}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Active Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {listings.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No active listings
                      </h3>
                      <p className="text-gray-500">
                        {isOwnProfile ? "Start selling by creating your first listing" : "This user hasn't listed any products yet"}
                      </p>
                      {isOwnProfile && (
                        <Button className="mt-4" onClick={() => window.location.href = '/sell'}>
                          Create Listing
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {listings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={listing.imageUrl || "https://images.unsplash.com/photo-1553531384-cc64ac80f931"}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">{listing.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {listing.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-lg font-bold text-green-600">
                                  ${listing.price}
                                </span>
                                <span className="text-gray-500">/{listing.unit}</span>
                              </div>
                              <Badge variant="outline">{listing.category}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews & Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-gray-500">
                        Reviews from buyers will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>B</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.zip && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {user.zip}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Member Since</h3>
                      <p className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {user.about && (
                      <div>
                        <h3 className="font-semibold mb-2">Bio</h3>
                        <p className="text-gray-600">{user.about}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-2">Verification Status</h3>
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Email Verified
                        </Badge>
                        <Badge variant="outline">
                          <Award className="h-3 w-3 mr-1" />
                          Trusted Seller
                        </Badge>
                      </div>
                    </div>
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