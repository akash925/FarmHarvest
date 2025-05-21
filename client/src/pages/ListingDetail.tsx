import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  MapPin,
  Star,
  Clock,
  Edit,
  Share2,
  ArrowLeft,
  Minus,
  Plus,
} from 'lucide-react';
import { formatDistance } from 'date-fns';

export default function ListingDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/listings/:id');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const listingId = params?.id;
  
  const [quantity, setQuantity] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/listings/${listingId}`]
  });
  
  const listing = data?.listing;
  const seller = data?.seller;
  
  // Increment quantity
  const incrementQuantity = () => {
    if (listing && quantity < listing.quantity) {
      setQuantity(quantity + 1);
    }
  };
  
  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Format price display
  const formatPrice = (price: number, unit: string) => {
    const dollars = (price / 100).toFixed(2);
    return `$${dollars}/${unit === 'pound' ? 'lb' : 'item'}`;
  };
  
  // Calculate total price
  const calculateTotal = () => {
    if (!listing) return 0;
    return (listing.price * quantity) / 100;
  };
  
  // Handle checkout
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a purchase",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (listing?.userId === user?.id) {
      toast({
        title: "Cannot purchase your own listing",
        description: "You cannot purchase your own listing",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/checkout/${listingId}?quantity=${quantity}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full" aria-label="Loading"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Listing Not Found</h1>
          <p className="text-slate-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/listings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{listing.title} | FarmDirect</title>
        <meta
          name="description"
          content={listing.description || `${listing.title} - Fresh local produce available for pickup.`}
        />
      </Helmet>
      
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </button>
          
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-xl bg-slate-100 mb-8 lg:mb-0">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  No image available
                </div>
              )}
            </div>
            
            {/* Product info */}
            <div>
              <div className="flex justify-between">
                <h1 className="text-2xl font-display font-bold text-slate-900">{listing.title}</h1>
                <div className="flex space-x-2">
                  {listing.userId === user?.id && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/listings/edit/${listing.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 flex items-center">
                <span className="text-xl font-semibold text-terracotta-500">
                  {formatPrice(listing.price, listing.unit)}
                </span>
                <span className="ml-2 text-sm text-slate-600">
                  {listing.quantity} {listing.unit === 'pound' ? 'lb' : 'items'} available
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {listing.category}
                  </span>
                  {listing.pickAndPack && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Pick & Pack
                    </span>
                  )}
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDistance(new Date(listing.createdAt), new Date(), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {/* Seller info */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img
                      src={seller?.image || 'https://via.placeholder.com/48x48?text=User'}
                      alt={seller?.name || 'Seller'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-slate-900">{seller?.name}</h3>
                    {seller?.zip && (
                      <p className="text-sm text-slate-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {seller.zip}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <Button variant="outline" onClick={() => navigate(`/users/${seller?.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                <div className="mt-2 text-slate-600">
                  {listing.description || 'No description provided.'}
                </div>
              </div>
              
              {/* Purchase section */}
              <div className="mt-8 border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="quantity">Quantity:</Label>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={listing.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 mx-2 text-center"
                    />
                    <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= listing.quantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between mb-6">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-semibold text-slate-900">${calculateTotal().toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full bg-primary-400 hover:bg-primary-500 text-white" 
                  onClick={handleCheckout}
                  disabled={listing.quantity === 0}
                >
                  {listing.quantity === 0 ? 'Out of Stock' : 'Proceed to Checkout'}
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    You'll need to sign in before completing your purchase.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
