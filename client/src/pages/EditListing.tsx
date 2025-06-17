import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

interface ListingFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  availableDate: string;
  pickAndPack: boolean;
}

export default function EditListing() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/listings/edit/:id');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const listingId = params?.id;

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    unit: 'pound',
    quantity: 1,
    imageUrl: '',
    availableDate: new Date().toISOString().split('T')[0],
    pickAndPack: false
  });

  // Fetch existing listing data
  const { data: listingData, isLoading: loadingListing } = useQuery({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
  });

  // Update form data when listing loads
  useEffect(() => {
    if (listingData?.listing) {
      const listing = listingData.listing;
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || '',
        price: listing.price ? listing.price / 100 : 0, // Convert from cents
        unit: listing.unit || 'pound',
        quantity: listing.quantity || 1,
        imageUrl: listing.imageUrl || '',
        availableDate: listing.availableDate ? 
          new Date(listing.availableDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        pickAndPack: listing.pickAndPack || false
      });
    }
  }, [listingData]);

  // Check if user owns this listing
  useEffect(() => {
    if (listingData?.listing && user && listingData.listing.userId !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own listings.",
        variant: "destructive",
      });
      navigate('/listings');
    }
  }, [listingData, user, navigate, toast]);

  const updateListingMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          price: Math.round(data.price * 100), // Convert to cents
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update listing');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Listing updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
      navigate(`/listings/${listingId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit listings.",
        variant: "destructive",
      });
      return;
    }

    updateListingMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ListingFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingListing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Listing | FarmDirect</title>
        <meta name="description" content="Edit your produce listing on FarmDirect" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/listings/${listingId}`)}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listing
          </button>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Edit Listing
          </h1>
          <p className="text-slate-600">
            Update your produce listing information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
            <CardDescription>
              Update the information about your produce.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Title *
                </label>
                <Input
                  placeholder="e.g., Fresh Organic Tomatoes"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your produce, growing methods, taste, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="herbs">Herbs</SelectItem>
                      <SelectItem value="eggs">Eggs</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Unit *
                  </label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pound">Per Pound</SelectItem>
                      <SelectItem value="item">Per Item</SelectItem>
                      <SelectItem value="bunch">Per Bunch</SelectItem>
                      <SelectItem value="dozen">Per Dozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Price ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.00"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Quantity Available *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.quantity || ''}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Available Date
                </label>
                <Input
                  type="date"
                  value={formData.availableDate}
                  onChange={(e) => handleInputChange('availableDate', e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/listings/${listingId}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateListingMutation.isPending}
                  className="flex-1"
                >
                  {updateListingMutation.isPending ? 'Updating...' : 'Update Listing'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 