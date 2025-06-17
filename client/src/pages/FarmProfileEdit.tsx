import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  locationVisibility: z.enum(['full', 'area', 'city']).default('city'),
  contactVisibility: z.enum(['phone', 'email', 'both']).default('email'),
  operationalHours: z.string().optional(),
  operationalDays: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function FarmProfileEdit() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch existing profile
  const { data: existing, isLoading } = useQuery({
    queryKey: ['farmProfile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/seller-profiles/${user!.id}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      farmName: existing?.profile?.farmName || '',
      bio: existing?.profile?.bio || '',
      address: existing?.profile?.address || '',
      phone: existing?.profile?.phone || '',
      locationVisibility: (existing?.profile?.locationVisibility as any) || 'city',
      contactVisibility: (existing?.profile?.contactVisibility as any) || 'email',
      operationalHours: existing?.profile?.operationalHours?.hours || '',
      operationalDays: existing?.profile?.operationalHours?.days?.join(', ') || '',
    },
  });

  // keep form in sync when query finishes
  useEffect(() => {
    if (existing?.profile) {
      const operationalHours = existing.profile.operationalHours || {};
      form.reset({
        farmName: existing.profile.farmName,
        bio: existing.profile.bio,
        address: existing.profile.address || '',
        phone: existing.profile.phone || '',
        locationVisibility: existing.profile.locationVisibility,
        contactVisibility: existing.profile.contactVisibility,
        operationalHours: operationalHours.hours || '',
        operationalDays: operationalHours.days?.join(', ') || '',
      });
    }
  }, [existing, form]);

  // save mutation
  const patchMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert operational hours back to expected format
      const profileData = {
        ...data,
        operationalHours: {
          hours: data.operationalHours || '',
          days: data.operationalDays ? data.operationalDays.split(',').map(d => d.trim()).filter(Boolean) : []
        }
      };
      // Remove the individual fields
      delete (profileData as any).operationalDays;
      
      const res = await fetch(`/api/seller-profiles/${user!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profile: profileData }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update profile');
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: 'Profile updated' });
      await queryClient.invalidateQueries({ queryKey: ['farmProfile', user!.id] });
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      navigate(`/seller-profile/${user!.id}`);
    },
    onError: (err: any) => setSubmitError(err.message),
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading…</div>;
  if (!user) return <div className="p-8 text-center">You must be logged in</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Farm Profile</CardTitle>
              <CardDescription>Update your farm details below.</CardDescription>
            </CardHeader>

            <form onSubmit={form.handleSubmit((vals) => patchMutation.mutate(vals))}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm/Business Name</Label>
                  <Input id="farmName" {...form.register('farmName')} />
                  {form.formState.errors.farmName && (
                    <p className="text-red-500 text-sm">{form.formState.errors.farmName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Your Farm</Label>
                  <Textarea id="bio" rows={4} {...form.register('bio')} />
                  {form.formState.errors.bio && (
                    <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Farm Address (Optional)</Label>
                  <Input id="address" {...form.register('address')} />
                </div>

                <div className="space-y-2">
                  <Label>Location Visibility</Label>
                  <Select
                    defaultValue={form.getValues('locationVisibility')}
                    onValueChange={(v) => form.setValue('locationVisibility', v as any)}
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
                  <Input id="phone" {...form.register('phone')} />
                </div>

                <div className="space-y-2">
                  <Label>Contact Preference</Label>
                  <Select
                    defaultValue={form.getValues('contactVisibility')}
                    onValueChange={(v) => form.setValue('contactVisibility', v as any)}
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

                <div className="space-y-2">
                  <Label htmlFor="operationalHours">Operational Hours (Optional)</Label>
                  <Input id="operationalHours" placeholder="e.g., 8:00 AM - 5:00 PM" {...form.register('operationalHours')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operationalDays">Days Open (Optional)</Label>
                  <Input id="operationalDays" placeholder="e.g., Monday, Tuesday, Wednesday, Thursday, Friday" {...form.register('operationalDays')} />
                  <p className="text-sm text-slate-500">Enter days separated by commas</p>
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={patchMutation.isPending}>
                  {patchMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
} 