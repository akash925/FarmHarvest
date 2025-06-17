import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from "@/lib/simpleAuth";
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Calendar, 
  Eye,
  Loader, 
  MessageSquare, 
  Star,
  ThumbsUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MessageCircle
} from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Review schema
const reviewSchema = z.object({
  rating: z.coerce.number().min(1, {
    message: 'Rating must be at least 1 star',
  }).max(5, {
    message: 'Rating can be at most 5 stars',
  }),
  comment: z.string().max(500, {
    message: 'Comment must be less than 500 characters',
  }).optional(),
  imageUrl: z.string().url({
    message: 'Please enter a valid URL for the image',
  }).optional().or(z.literal('')),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function OrderCard({ order, type }: { order: any, type: 'buying' | 'selling' }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch the listing details
  const { data: listingData, isLoading: isLoadingListing } = useQuery({
    queryKey: [`/api/listings/${order.listingId}`],
  });
  
  const listing = listingData?.listing;
  
  // Format price
  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };
  
  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Review form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
      imageUrl: '',
    }
  });
  
  const onSubmitReview = async (values: ReviewFormValues) => {
    try {
      setIsSubmitting(true);
      
      const reviewData = {
        ...values,
        orderId: order.id,
      };
      
      const response = await apiRequest('POST', '/api/reviews', reviewData);
      
      if (response.ok) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: [`/api/reviews/seller/${order.sellerId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        
        toast({
          title: 'Review Submitted',
          description: 'Thank you for your feedback!',
        });
        
        // Close dialog (would typically handle this with state)
        document.body.click(); // Hack to close dialog
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Submit Review',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If listing is still loading
  if (isLoadingListing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If listing not found
  if (!listing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center text-red-500">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Listing not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div className="h-16 w-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
            <img
              src={listing.imageUrl || 'https://via.placeholder.com/64x64?text=Product'}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <h3 className="font-semibold text-slate-900">{listing.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : order.status === 'paid' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 mt-1">
              {type === 'buying' ? 'Seller:' : 'Buyer:'} {type === 'buying' ? order.sellerName : order.buyerName}
            </p>
            
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-600">
                Quantity: {order.quantity} {listing.unit === 'pound' ? 'lb' : 'items'}
              </span>
              <span className="font-medium">${formatPrice(order.totalPrice)}</span>
            </div>
            
            <div className="mt-2 text-xs text-slate-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(order.createdAt)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/listings/${listing.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Listing
        </Button>
        
        {type === 'buying' && order.status === 'paid' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary-400 hover:bg-primary-500">
                <Star className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with the seller and their produce.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= field.value
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-slate-600">
                              {field.value} / 5
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comment</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your experience with this seller and their produce..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Share a photo of the produce you received.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary-400 hover:bg-primary-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        
        {type === 'selling' && order.status === 'paid' && (
          <Button size="sm" className="bg-primary-400 hover:bg-primary-500">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Buyer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function MyOrders() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  // Fetch orders based on active tab
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/orders?type=${activeTab}`],
  });
  
  const orders = data?.orders || [];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <Helmet>
        <title>My Orders | FarmDirect</title>
        <meta
          name="description"
          content="View and manage your orders. Track purchases and sales of fresh local produce."
        />
      </Helmet>
      
      <div className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Button>
          
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-slate-900">My Orders</h1>
            <p className="text-slate-600">View and manage your purchases and sales.</p>
          </div>
          
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'buying' | 'selling')}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="buying">Purchases</TabsTrigger>
              <TabsTrigger value="selling">Sales</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buying">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-2" />
                  <p className="text-slate-600">Loading your purchases...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Failed to load your orders.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/orders'] })}
                  >
                    Try Again
                  </Button>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Order #{order.id}
                              {getStatusIcon(order.status)}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{item.title}</span>
                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                              </div>
                              <span className="font-medium">
                                ${(item.price / 100).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between items-center">
                          <div className="text-lg font-bold">
                            Total: ${(order.total / 100).toFixed(2)}
                          </div>
                          <div className="flex gap-2">
                            {order.status === 'delivered' && (
                              <Button variant="outline" size="sm">
                                <Star className="h-4 w-4 mr-2" />
                                Rate Order
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact Seller
                            </Button>
                            <Button size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <ThumbsUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">No purchases yet</h2>
                  <p className="text-slate-600 mb-6">You haven't purchased any local produce yet.</p>
                  <Button onClick={() => navigate('/listings')}>
                    Browse Listings
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="selling">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-2" />
                  <p className="text-slate-600">Loading your sales...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Failed to load your orders.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/orders'] })}
                  >
                    Try Again
                  </Button>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Order #{order.id}
                              {getStatusIcon(order.status)}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{item.title}</span>
                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                              </div>
                              <span className="font-medium">
                                ${(item.price / 100).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between items-center">
                          <div className="text-lg font-bold">
                            Total: ${(order.total / 100).toFixed(2)}
                          </div>
                          <div className="flex gap-2">
                            {order.status === 'delivered' && (
                              <Button variant="outline" size="sm">
                                <Star className="h-4 w-4 mr-2" />
                                Rate Order
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact Buyer
                            </Button>
                            <Button size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <ThumbsUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">No sales yet</h2>
                  <p className="text-slate-600 mb-6">You haven't sold any produce yet.</p>
                  <Button onClick={() => navigate('/listings/new')}>
                    Create a Listing
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
