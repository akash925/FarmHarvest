import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from '@/components/ui/alert';

// Simplified schema for basic seller profile
const sellerProfileSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  locationVisibility: z.enum(['full', 'area', 'city']).default('city'),
  contactVisibility: z.enum(['phone', 'email', 'both']).default('email'),
});

type SellerProfileForm = z.infer<typeof sellerProfileSchema>;

export default function SellerProfileSetup() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<SellerProfileForm>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      farmName: '',
      bio: '',
      address: '',
      phone: '',
      locationVisibility: 'city',
      contactVisibility: 'email',
    },
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: SellerProfileForm) => {
      const response = await fetch('/api/seller-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create seller profile');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: 'Profile Created!',
        description: 'Your seller profile has been created successfully!',
      });

      // Invalidate session cache so Navbar updates immediately
      await queryClient.invalidateQueries({ queryKey: ['session'] });

      // Navigate to the seller profile page
      navigate(`/seller-profile/${user?.id}`);
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create profile');
    },
  });

  const onSubmit = (data: SellerProfileForm) => {
    setSubmitError(null);
    createProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to set up your seller profile.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Seller Profile</CardTitle>
              <CardDescription>
                Set up your farm profile to start selling fresh produce to local customers.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm/Business Name</Label>
                  <Input
                    id="farmName"
                    placeholder="Sunnydale Organic Farm"
                    {...form.register('farmName')}
                  />
                  {form.formState.errors.farmName && (
                    <p className="text-red-500 text-sm">{form.formState.errors.farmName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Your Farm</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about your farm, your growing practices, and what makes your produce special..."
                    rows={4}
                    {...form.register('bio')}
                  />
                  {form.formState.errors.bio && (
                    <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Farm Address (Optional)</Label>
                  <Input
                    id="address"
                    placeholder="123 Farm Lane, Agricultural City, AC 12345"
                    {...form.register('address')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location Visibility</Label>
                  <Select
                    onValueChange={(value) => form.setValue('locationVisibility', value as 'full' | 'area' | 'city')}
                    defaultValue={form.getValues('locationVisibility')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose how to display your location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Address</SelectItem>
                      <SelectItem value="area">General Area Only</SelectItem>
                      <SelectItem value="city">City/Zip Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...form.register('phone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Preference</Label>
                  <Select
                    onValueChange={(value) => form.setValue('contactVisibility', value as 'phone' | 'email' | 'both')}
                    defaultValue={form.getValues('contactVisibility')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose how customers can contact you" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="phone">Phone Only</SelectItem>
                      <SelectItem value="both">Both Phone and Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/sell')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProfileMutation.isPending}
                >
                  {createProfileMutation.isPending ? 'Creating Profile...' : 'Create Profile'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}