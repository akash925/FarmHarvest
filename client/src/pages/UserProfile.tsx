import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Package, Calendar, Mail } from "lucide-react";
import { User, Listing, Review } from "@shared/schema";

export default function UserProfile() {
  const [, params] = useRoute("/users/:id");
  const userId = params?.id ? parseInt(params.id) : null;

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

  if (!userId) {
    return <div className="container mx-auto px-4 py-8">User not found</div>;
  }

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">User not found</div>;
  }

  const averageRating = reviewsData?.reviews?.length 
    ? reviewsData.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsData.reviews.length 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">{user.name || "Anonymous User"}</h1>
                  <Button
                    onClick={() => {
                      if (user.email) {
                        window.location.href = `mailto:${user.email}?subject=Hello from Farm Direct`;
                      }
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 text-muted-foreground">
                  {user.zip && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.zip}</span>
                    </div>
                  )}
                  
                  {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{averageRating.toFixed(1)} ({reviewsData.reviews.length} reviews)</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {user.about && (
                  <p className="text-muted-foreground mt-2">{user.about}</p>
                )}
                
                {user.productsGrown && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Grows: </span>
                    <span className="text-muted-foreground">{user.productsGrown}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Active Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Active Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : listingsData?.listings && listingsData.listings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listingsData.listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {listing.imageUrl && (
                      <img 
                        src={listing.imageUrl} 
                        alt={listing.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold mb-1">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{listing.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">${listing.pricePerUnit}/{listing.unit}</span>
                      <Badge variant="secondary">{listing.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active listings found.</p>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews & Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}