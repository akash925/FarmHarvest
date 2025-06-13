import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from "@/lib/simpleAuth";
import { useToast } from '@/hooks/use-toast';
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
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters',
  }),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, {
    message: 'Must be a valid US ZIP code (e.g., 12345 or 12345-6789)',
  }),
  about: z.string().max(500, {
    message: 'Bio must be less than 500 characters',
  }).optional().or(z.literal('')),
  productsGrown: z.string().max(200, {
    message: 'Products grown must be less than 200 characters',
  }).optional().or(z.literal('')),
  image: z.string().url({
    message: 'Please enter a valid URL for your profile image',
  }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      zip: user?.zip || '',
      about: user?.about || '',
      productsGrown: user?.productsGrown || '',
      image: user?.image || '',
    }
  });
  
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('PUT', `/api/users/${user!.id}`, values);
      
      if (response.ok) {
        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user!.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
        
        navigate(`/users/${user!.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Update Profile',
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
        <title>Edit Profile | FarmDirect</title>
        <meta
          name="description"
          content="Update your FarmDirect profile. Add information about your farm, growing methods, and products offered."
        />
      </Helmet>
      
      <div className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
            onClick={() => navigate(`/users/${user!.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to profile
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Edit Your Profile</CardTitle>
              <CardDescription>
                Update your personal information, farm/garden details, and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your full name or farm/garden name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your location ZIP code helps buyers find you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell buyers about your farm or garden..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your growing methods, farm history, or anything else buyers should know.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="productsGrown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Products Grown</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. tomatoes, lettuce, eggs" {...field} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of products you typically grow.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          A URL to your profile image. Clear images help build trust with buyers.
                        </FormDescription>
                        <FormMessage />
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
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
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
