import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Star, 
  AlertTriangle,
  Loader 
} from 'lucide-react';
import ListingCard from '@/components/ListingCard';

export default function UserProfile() {
  const [, params] = useRoute('/users/:id');
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const userId = params?.id;
  
  const { data: userData, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });
  
  const { data: userListingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: [`/api/listings?userId=${userId}`],
  });
  
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/reviews/seller/${userId}`],
  });
  
  const user = userData?.user;
  const listings = userListingsData?.listings || [];
  const reviews = reviewsData?.reviews || [];
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  
  const isCurrentUserProfile = currentUser?.id === parseInt(userId!);
  
  // Loading state
  if (isLoadingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }
  
  // Error state
  if (userError || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h1>
          <p className="text-slate-600 mb-6">The user profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{user.name} | FarmDirect</title>
        <meta
          name="description"
          content={`Check out ${user.name}'s profile and available produce on FarmDirect. Fresh local produce for pickup.`}
        />
      </Helmet>
      
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Button>
          
          <div className="mb-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100">
                  <img
                    src={user.image || 'https://via.placeholder.com/96x96?text=User'}
                    alt={user.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <h1 className="text-2xl font-display font-bold text-slate-900">{user.name}</h1>
                  {user.zip && (
                    <p className="text-slate-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.zip}
                    </p>
                  )}
                  {reviews.length > 0 && (
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-slate-500">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {isCurrentUserProfile && (
                <div className="mt-4 sm:mt-0">
                  <Button onClick={() => navigate('/profile/edit')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
            
            {user.about && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">About</h2>
                <p className="text-slate-600">{user.about}</p>
              </div>
            )}
            
            {user.productsGrown && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Products Grown</h2>
                <div className="flex flex-wrap gap-2">
                  {user.productsGrown.split(',').map((product, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                    >
                      {product.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="listings">
            <TabsList className="mb-6">
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="listings">
              {isLoadingListings ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-2" />
                  <p className="text-slate-600">Loading listings...</p>
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 mb-4">No listings found for this user.</p>
                  {isCurrentUserProfile && (
                    <Button onClick={() => navigate('/listings/new')}>
                      Create Your First Listing
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              {isLoadingReviews ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-2" />
                  <p className="text-slate-600">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {review.comment && (
                              <p className="mt-2 text-slate-600">{review.comment}</p>
                            )}
                            
                            {review.imageUrl && (
                              <div className="mt-3">
                                <img
                                  src={review.imageUrl}
                                  alt="Review"
                                  className="h-24 w-auto object-cover rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <p className="text-slate-600">No reviews yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
