import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { InsertListing } from '@shared/schema';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertListingSchema } from '@shared/schema';
import { ArrowLeft, RefreshCw } from 'lucide-react';

// Extend the insert schema with client-side validations
const createListingSchema = z.object({
  title: z.string().min(3, {
    message: 'Title must be at least 3 characters',
  }).max(100, {
    message: 'Title must be less than 100 characters',
  }),
  category: z.string().min(1, {
    message: 'Please select a category',
  }),
  description: z.string().optional(),
  price: z.coerce.number().int().positive({
    message: 'Price must be a positive number',
  }),
  unit: z.string().min(1, {
    message: 'Please select a unit',
  }),
  quantity: z.coerce.number().int().positive({
    message: 'Quantity must be a positive number',
  }),
  pickAndPack: z.boolean().default(false),
  imageUrl: z.string().url({
    message: 'Please enter a valid URL for the image',
  }).optional().or(z.literal('')),
});

type CreateListingFormValues = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: '',
      category: 'Vegetables',
      description: '',
      price: undefined,
      unit: 'item',
      quantity: undefined,
      pickAndPack: false,
      imageUrl: '',
    }
  });
  
  const onSubmit = async (values: CreateListingFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert price to cents for storage
      const listingData: InsertListing = {
        ...values,
        price: Math.round(values.price * 100), // Convert dollars to cents
        userId: user!.id,
      };
      
      const response = await apiRequest('POST', '/api/listings', listingData);
      
      if (response.ok) {
        // Invalidate the listings query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/listings/featured'] });
        
        toast({
          title: 'Listing Created',
          description: 'Your produce listing has been created successfully.',
        });
        
        navigate('/listings');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Create Listing',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Create Listing | FarmDirect</title>
        <meta
          name="description"
          content="List your fresh produce for sale. Connect with local buyers and sell your home-grown fruits, vegetables, eggs, and more."
        />
      </Helmet>
      
      <div className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
            onClick={() => navigate('/listings')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Create a New Listing</CardTitle>
              <CardDescription>
                List your produce for local buyers. Provide accurate information about your produce, pricing, and availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Organic Heirloom Tomatoes" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your produce.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fruits">Fruits</SelectItem>
                            <SelectItem value="Vegetables">Vegetables</SelectItem>
                            <SelectItem value="Eggs">Eggs</SelectItem>
                            <SelectItem value="Herbs">Herbs</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the category that best fits your produce.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your produce, growing methods, etc."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your produce, growing methods, freshness, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Price per unit or pound.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="item">Item (each)</SelectItem>
                              <SelectItem value="pound">Pound (lb)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How is your produce sold?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Available</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          How many items or pounds do you have available?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image of your produce. Clear images help attract buyers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pickAndPack"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Pick and Pack Option</FormLabel>
                          <FormDescription>
                            Allow buyers to pick their own produce on-site.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full md:w-auto bg-primary-400 hover:bg-primary-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Listing'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
