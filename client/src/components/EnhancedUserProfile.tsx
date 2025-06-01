import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Star, Package, Calendar, Mail, Phone, 
  Award, Truck, Clock, MessageCircle, Heart,
  ShoppingCart, Leaf, Users, TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Listing, Review, Order } from "@shared/schema";

interface EnhancedUserProfileProps {
  userId: number;
  showPrivateInfo?: boolean;
}

export default function EnhancedUserProfile({ userId, showPrivateInfo = false }: EnhancedUserProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: listingsData, isLoading: listingsLoading } = useQuery<{ listings: Listing[] }>({
    queryKey: [`/api/listings/user/${userId}`],
    enabled: !!userId,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<{ reviews: Review[] }>({
    queryKey: [`/api/reviews/seller/${userId}`],
    enabled: !!userId,
  });

  const { data: sellerStats } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
    enabled: !!userId,
  });

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-600">User not found</h1>
      </div>
    );
  }

  const listings = listingsData?.listings || [];
  const reviews = reviewsData?.reviews || [];
  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const stats = {
    totalListings: listings.length,
    totalSales: sellerStats?.totalSales || 0,
    responseRate: sellerStats?.responseRate || 95,
    memberSince: new Date(user.createdAt).getFullYear(),
    averageRating: averageRating,
    totalReviews: reviews.length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-3xl bg-white">
                  {(user.name && user.name.charAt(0)) || (user.email && user.email.charAt(0).toUpperCase()) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name || "Anonymous User"}</h1>
                    {averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    {user.zip && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.zip}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {stats.memberSince}</span>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Verified Seller
                    </Badge>
                  </div>
                </div>

                {user.about && (
                  <p className="text-gray-600 max-w-2xl">{user.about}</p>
                )}

                {user.productsGrown && (
                  <div>
                    <h3 className="font-semibold mb-2">Specializes in:</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.productsGrown.split(',').map((product, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          {product.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalListings}</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <div className="text-sm text-muted-foreground">Customer Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Listings ({stats.totalListings})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{listing.category}</Badge>
                        <span className="font-bold text-lg">${listing.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground">This seller hasn't posted any listings.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.rating}/5</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">Be the first to leave a review for this seller!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Farm Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Located in {user.zip}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Offers local delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        <span>Sustainable farming practices</span>
                      </div>
                    </div>
                  </div>
                  
                  {showPrivateInfo && (
                    <div>
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {user.about && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-gray-600">{user.about}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}