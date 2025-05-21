import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Loader, 
  ShieldCheck 
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component using Stripe Elements
function CheckoutForm({ amount, listingId, quantity }: { 
  amount: number; 
  listingId: string; 
  quantity: number; 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An unknown error occurred');
        toast({
          title: 'Payment Failed',
          description: error.message || 'There was an issue processing your payment',
          variant: 'destructive',
        });
      } else {
        // Payment succeeded (this code won't run since we're redirecting)
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
        navigate('/orders');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unknown error occurred');
      toast({
        title: 'Payment Error',
        description: error.message || 'There was an issue processing your payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 p-3 rounded-md text-red-500 mb-4 text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-primary-400 hover:bg-primary-500"
      >
        {isProcessing ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [, params] = useRoute('/checkout/:listingId');
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const listingId = params?.listingId;
  const quantity = parseInt(searchParams.get('quantity') || '1');
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  // Fetch listing details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/listings/${listingId}`],
  });
  
  const listing = data?.listing;
  const seller = data?.seller;
  
  // Format price display
  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };
  
  // Calculate total price
  const calculateTotal = () => {
    if (!listing) return 0;
    return listing.price * quantity;
  };
  
  // Calculate platform fee (15%)
  const calculatePlatformFee = () => {
    return Math.round(calculateTotal() * 0.15);
  };
  
  // Get total amount to pay
  const getTotalAmount = () => {
    return calculateTotal() + calculatePlatformFee();
  };
  
  // Create payment intent when component mounts
  useEffect(() => {
    if (listing && listingId) {
      const createIntent = async () => {
        try {
          const response = await apiRequest('POST', '/api/create-payment-intent', {
            listingId: parseInt(listingId),
            quantity: quantity,
            amount: getTotalAmount()
          });
          
          if (response.ok) {
            const data = await response.json();
            setClientSecret(data.clientSecret);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create payment intent');
          }
        } catch (error: any) {
          toast({
            title: 'Payment Setup Failed',
            description: error.message || 'An error occurred setting up the payment',
            variant: 'destructive',
          });
        }
      };
      
      createIntent();
    }
  }, [listing, listingId, quantity]);
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Listing Not Found</h1>
          <p className="text-slate-600 mb-6">The item you're trying to purchase doesn't exist or has been removed.</p>
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
        <title>Checkout | FarmDirect</title>
        <meta
          name="description"
          content="Complete your purchase of fresh local produce on FarmDirect."
        />
      </Helmet>
      
      <div className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
            onClick={() => navigate(`/listings/${listingId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listing
          </Button>
          
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your order details before payment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-16 w-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={listing.imageUrl || 'https://via.placeholder.com/64x64?text=Product'}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                      <p className="text-sm text-slate-600">
                        {listing.category} • Sold by {seller?.name}
                      </p>
                      <div className="mt-1 flex justify-between">
                        <span className="text-sm">
                          ${formatPrice(listing.price)} per {listing.unit === 'pound' ? 'lb' : 'item'}
                        </span>
                        <span className="text-sm">Quantity: {quantity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span>${formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Platform Fee (15%):</span>
                      <span>${formatPrice(calculatePlatformFee())}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${formatPrice(getTotalAmount())}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 flex items-start">
                    <ShieldCheck className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                    <p>Your payment is secured through Stripe. You will arrange pickup with the seller after payment.</p>
                  </div>
                  
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        amount={getTotalAmount()} 
                        listingId={listingId!}
                        quantity={quantity}
                      />
                    </Elements>
                  ) : (
                    <div className="flex justify-center items-center py-4">
                      <Loader className="h-8 w-8 animate-spin text-primary-400" />
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100">
                      <img
                        src={seller?.image || 'https://via.placeholder.com/40x40?text=User'}
                        alt={seller?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-slate-900">{seller?.name}</h3>
                      {seller?.zip && (
                        <p className="text-sm text-slate-600">ZIP: {seller.zip}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600">
                    <p>After payment, you'll coordinate with the seller for pickup.</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(`/users/${seller?.id}`)}
                  >
                    View Seller Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
