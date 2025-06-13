import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/lib/simpleAuth";

import { apiRequest } from '@/lib/queryClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

// Define form schemas for each step
const basicInfoSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
});

const contactInfoSchema = z.object({
  address: z.string().optional(),
  locationVisibility: z.enum(['full', 'area', 'city']),
  phone: z.string().optional(),
  contactVisibility: z.enum(['phone', 'email', 'both']),
});

const operationalHoursSchema = z.object({
  days: z.array(z.string()),
  hours: z.string(),
});

const farmSpaceSchema = z.object({
  squareFootage: z.number().min(1, 'Square footage must be at least 1'),
  soilType: z.string(),
  lightConditions: z.string(),
  irrigationOptions: z.string(),
  managementLevel: z.string(),
  price: z.number().min(1, 'Price must be at least 1'),
  pricingType: z.enum(['monthly', 'seasonal', 'flat']),
  additionalNotes: z.string().optional(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;
type ContactInfoValues = z.infer<typeof contactInfoSchema>;
type OperationalHoursValues = z.infer<typeof operationalHoursSchema>;
type FarmSpaceValues = z.infer<typeof farmSpaceSchema>;

export default function SellerProfileSetup() {
  const { user, isInitializing } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<string>('basic');
  const [profileData, setProfileData] = useState({
    basic: {
      farmName: '',
      bio: '',
    },
    contact: {
      address: '',
      locationVisibility: 'city',
      phone: '',
      contactVisibility: 'email',
    },
    hours: {
      days: [],
      hours: '',
    },
    space: {
      hasSpace: false,
      spaces: [] as FarmSpaceValues[],
    },
    media: {
      uploads: [] as { mediaType: 'photo' | 'video'; url: string; caption: string }[],
    },
  });

  // Basic Info Form
  const basicInfoForm = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: profileData.basic,
  });

  // Contact Info Form
  const contactInfoForm = useForm<ContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: profileData.contact,
  });

  // Hours Form
  const hoursForm = useForm<OperationalHoursValues>({
    resolver: zodResolver(operationalHoursSchema),
    defaultValues: profileData.hours,
  });

  // Farm Space Form
  const farmSpaceForm = useForm<FarmSpaceValues>({
    resolver: zodResolver(farmSpaceSchema),
    defaultValues: {
      squareFootage: 0,
      soilType: 'loam',
      lightConditions: 'full_sun',
      irrigationOptions: 'manual',
      managementLevel: 'daily_visit',
      price: 0,
      pricingType: 'monthly',
      additionalNotes: '',
    },
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/seller-profiles', {
        profile: data
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Create farm spaces if any
      if (profileData.space.hasSpace && profileData.space.spaces.length > 0) {
        profileData.space.spaces.forEach(async (space) => {
          await apiRequest('POST', '/api/farm-spaces', {
            farmSpace: {
              ...space,
              sellerProfileId: data.profile.id
            }
          });
        });
      }

      // Upload media if any
      if (profileData.media.uploads.length > 0) {
        profileData.media.uploads.forEach(async (media) => {
          await apiRequest('POST', '/api/profile-media', {
            media: {
              ...media,
              sellerProfileId: data.profile.id
            }
          });
        });
      }

      toast({
        title: 'Profile Created!',
        description: 'Your seller profile has been created successfully!',
      });

      // Navigate to the seller profile page
      navigate(`/seller-profile/${user?.id}`);
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onBasicInfoSubmit = (data: BasicInfoValues) => {
    setProfileData((prev) => ({
      ...prev,
      basic: data,
    }));
    setCurrentStep('contact');
  };

  const onContactInfoSubmit = (data: ContactInfoValues) => {
    setProfileData((prev) => ({
      ...prev,
      contact: data,
    }));
    setCurrentStep('hours');
  };

  const onHoursSubmit = (data: OperationalHoursValues) => {
    setProfileData((prev) => ({
      ...prev,
      hours: data,
    }));
    setCurrentStep('space');
  };

  const onSpaceSubmit = (data: FarmSpaceValues) => {
    if (profileData.space.hasSpace) {
      setProfileData((prev) => ({
        ...prev,
        space: {
          ...prev.space,
          spaces: [...prev.space.spaces, data],
        },
      }));
    }
    setCurrentStep('media');
  };

  const onAddMedia = (mediaType: 'photo' | 'video', url: string, caption: string) => {
    setProfileData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        uploads: [...prev.media.uploads, { mediaType, url, caption }],
      },
    }));
  };

  const handleSpaceToggle = (value: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      space: {
        ...prev.space,
        hasSpace: value,
      },
    }));
  };

  const handleSubmitProfile = () => {
    // Combine all data and submit
    const completeProfile = {
      userId: user?.id,
      farmName: profileData.basic.farmName,
      bio: profileData.basic.bio,
      address: profileData.contact.address,
      locationVisibility: profileData.contact.locationVisibility,
      phone: profileData.contact.phone,
      contactVisibility: profileData.contact.contactVisibility,
      operationalHours: profileData.hours,
    };

    createProfileMutation.mutate(completeProfile);
  };

  if (isInitializing) {
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
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-6">Enhanced Seller Profile Setup</h1>
      <p className="text-slate-600 mb-8">Complete the following steps to set up your enhanced seller profile.</p>

      <Tabs value={currentStep} onValueChange={setCurrentStep}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="space">Farm Space</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Farm Information</CardTitle>
              <CardDescription>Tell customers about your farm or garden.</CardDescription>
            </CardHeader>
            <form onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    placeholder="Sunnydale Organic Farm"
                    {...basicInfoForm.register('farmName')}
                  />
                  {basicInfoForm.formState.errors.farmName && (
                    <p className="text-red-500 text-sm">{basicInfoForm.formState.errors.farmName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about your farm, your growing practices, and what makes your produce special..."
                    rows={6}
                    {...basicInfoForm.register('bio')}
                  />
                  {basicInfoForm.formState.errors.bio && (
                    <p className="text-red-500 text-sm">{basicInfoForm.formState.errors.bio.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Next: Contact Information</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Contact Info */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you.</CardDescription>
            </CardHeader>
            <form onSubmit={contactInfoForm.handleSubmit(onContactInfoSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Farm Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Farm Lane, Agricultural City, AC 12345"
                    {...contactInfoForm.register('address')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location Visibility</Label>
                  <Select
                    onValueChange={(value) => contactInfoForm.setValue('locationVisibility', value as 'full' | 'area' | 'city')}
                    defaultValue={contactInfoForm.getValues('locationVisibility')}
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...contactInfoForm.register('phone')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Preference</Label>
                  <Select
                    onValueChange={(value) => contactInfoForm.setValue('contactVisibility', value as 'phone' | 'email' | 'both')}
                    defaultValue={contactInfoForm.getValues('contactVisibility')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose how customers can contact you" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Only</SelectItem>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="both">Both Phone and Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('basic')}>Back</Button>
                <Button type="submit">Next: Operational Hours</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Operational Hours</CardTitle>
              <CardDescription>When customers can visit or pick up produce.</CardDescription>
            </CardHeader>
            <form onSubmit={hoursForm.handleSubmit(onHoursSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Days Open</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day}
                          value={day}
                          onChange={(e) => {
                            const current = hoursForm.getValues('days') || [];
                            if (e.target.checked) {
                              hoursForm.setValue('days', [...current, day]);
                            } else {
                              hoursForm.setValue('days', current.filter(d => d !== day));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={day}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    placeholder="9:00 AM - 5:00 PM"
                    {...hoursForm.register('hours')}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('contact')}>Back</Button>
                <Button type="submit">Next: Farm Space</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Farm Space */}
        <TabsContent value="space">
          <Card>
            <CardHeader>
              <CardTitle>Farm Space Sharing</CardTitle>
              <CardDescription>Offer space on your land for others to garden or farm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-space"
                  checked={profileData.space.hasSpace}
                  onCheckedChange={handleSpaceToggle}
                />
                <Label htmlFor="has-space">I have space available to share</Label>
              </div>

              {profileData.space.hasSpace && (
                <form onSubmit={farmSpaceForm.handleSubmit(onSpaceSubmit)} className="space-y-4 mt-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="squareFootage">Square Footage</Label>
                    <Input
                      id="squareFootage"
                      type="number"
                      placeholder="500"
                      {...farmSpaceForm.register('squareFootage', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type</Label>
                    <Select
                      onValueChange={(value) => farmSpaceForm.setValue('soilType', value)}
                      defaultValue={farmSpaceForm.getValues('soilType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loam">Loam</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="custom">Custom (describe in notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lightConditions">Light Conditions</Label>
                    <Select
                      onValueChange={(value) => farmSpaceForm.setValue('lightConditions', value)}
                      defaultValue={farmSpaceForm.getValues('lightConditions')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select light conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_sun">Full Sun</SelectItem>
                        <SelectItem value="partial_shade">Partial Shade</SelectItem>
                        <SelectItem value="mostly_shaded">Mostly Shaded</SelectItem>
                        <SelectItem value="custom">Custom (describe in notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="irrigation">Irrigation Options</Label>
                    <Select
                      onValueChange={(value) => farmSpaceForm.setValue('irrigationOptions', value)}
                      defaultValue={farmSpaceForm.getValues('irrigationOptions')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select irrigation options" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Watering</SelectItem>
                        <SelectItem value="automated">Automated System</SelectItem>
                        <SelectItem value="natural">Natural/Rain-fed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="management">Management Level</Label>
                    <Select
                      onValueChange={(value) => farmSpaceForm.setValue('managementLevel', value)}
                      defaultValue={farmSpaceForm.getValues('managementLevel')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select management level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hands_off">Hands-off (minimal oversight)</SelectItem>
                        <SelectItem value="daily_visit">Daily Visit Required</SelectItem>
                        <SelectItem value="multiple_visits">Multiple Daily Visits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="150"
                        {...farmSpaceForm.register('price', { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pricingType">Pricing Type</Label>
                      <Select
                        onValueChange={(value) => farmSpaceForm.setValue('pricingType', value as 'monthly' | 'seasonal' | 'flat')}
                        defaultValue={farmSpaceForm.getValues('pricingType')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                          <SelectItem value="flat">Flat Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any additional details about the space..."
                      rows={4}
                      {...farmSpaceForm.register('additionalNotes')}
                    />
                  </div>

                  <Button type="submit" className="w-full">Add Farm Space</Button>

                  {profileData.space.spaces.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Added Spaces ({profileData.space.spaces.length})</h3>
                      <div className="space-y-2">
                        {profileData.space.spaces.map((space, index) => (
                          <div key={index} className="p-2 bg-slate-50 rounded-md">
                            <p className="font-medium">{space.squareFootage} sq ft - ${space.price}/{space.pricingType}</p>
                            <p className="text-sm text-slate-500">{space.soilType} soil, {space.lightConditions.replace('_', ' ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('hours')}>Back</Button>
              <Button onClick={() => setCurrentStep('media')}>Next: Media</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Farm Media Gallery</CardTitle>
              <CardDescription>Add photos and videos of your farm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">Add Photo</h3>
                    <Input id="photoUrl" placeholder="Photo URL" />
                    <Input id="photoCaption" placeholder="Caption (optional)" />
                    <Button 
                      onClick={() => {
                        const url = (document.getElementById('photoUrl') as HTMLInputElement).value;
                        const caption = (document.getElementById('photoCaption') as HTMLInputElement).value;
                        if (url) {
                          onAddMedia('photo', url, caption);
                          (document.getElementById('photoUrl') as HTMLInputElement).value = '';
                          (document.getElementById('photoCaption') as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-full mt-2"
                    >
                      Add Photo
                    </Button>
                  </div>
                  
                  <div className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">Add Video</h3>
                    <Input id="videoUrl" placeholder="Video URL" />
                    <Input id="videoCaption" placeholder="Caption (optional)" />
                    <Button 
                      onClick={() => {
                        const url = (document.getElementById('videoUrl') as HTMLInputElement).value;
                        const caption = (document.getElementById('videoCaption') as HTMLInputElement).value;
                        if (url) {
                          onAddMedia('video', url, caption);
                          (document.getElementById('videoUrl') as HTMLInputElement).value = '';
                          (document.getElementById('videoCaption') as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-full mt-2"
                    >
                      Add Video
                    </Button>
                  </div>
                </div>
                
                {profileData.media.uploads.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Media Gallery ({profileData.media.uploads.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profileData.media.uploads.map((item, index) => (
                        <div key={index} className="relative">
                          {item.mediaType === 'photo' ? (
                            <img
                              src={item.url}
                              alt={item.caption || `Farm photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-32 bg-slate-200 flex items-center justify-center rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {item.caption && (
                            <p className="text-xs mt-1 text-center text-slate-600 truncate">{item.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('space')}>Back</Button>
              <Button 
                onClick={handleSubmitProfile}
                disabled={createProfileMutation.isPending}
              >
                {createProfileMutation.isPending ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}