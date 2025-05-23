import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, queryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Camera, 
  Plus, 
  Trash2,
  Upload,
  Ruler,
  Sun,
  Droplets,
  Users,
  DollarSign
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const sellerProfileSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  locationVisibility: z.enum(["full", "area", "city"]),
  phone: z.string().optional(),
  contactVisibility: z.enum(["email", "phone", "both"]),
  operationalDays: z.array(z.string()).min(1, "Select at least one day"),
  operationalHours: z.string().min(1, "Please specify operating hours"),
});

const farmSpaceSchema = z.object({
  squareFootage: z.number().min(1, "Square footage must be greater than 0"),
  soilType: z.enum(["loam", "clay", "sandy", "mixed", "custom"]),
  customSoilType: z.string().optional(),
  lightConditions: z.enum(["full_sun", "partial_shade", "mostly_shaded", "custom"]),
  customLightConditions: z.string().optional(),
  irrigationOptions: z.enum(["manual", "automated", "natural"]),
  managementLevel: z.enum(["hands_off", "daily_visit", "multiple_visits"]),
  price: z.number().min(0, "Price must be 0 or greater"),
  pricingType: z.enum(["monthly", "seasonal", "flat"]),
  additionalNotes: z.string().optional(),
});

type SellerProfileFormData = z.infer<typeof sellerProfileSchema>;
type FarmSpaceFormData = z.infer<typeof farmSpaceSchema>;

export default function SellerProfileSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [farmSpaces, setFarmSpaces] = useState<FarmSpaceFormData[]>([]);

  const profileForm = useForm<SellerProfileFormData>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      farmName: "",
      bio: "",
      address: "",
      locationVisibility: "city",
      phone: "",
      contactVisibility: "email",
      operationalDays: [],
      operationalHours: "",
    }
  });

  const farmSpaceForm = useForm<FarmSpaceFormData>({
    resolver: zodResolver(farmSpaceSchema),
    defaultValues: {
      squareFootage: 0,
      soilType: "loam",
      lightConditions: "full_sun",
      irrigationOptions: "manual",
      managementLevel: "hands_off",
      price: 0,
      pricingType: "monthly",
      additionalNotes: "",
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: SellerProfileFormData) => {
      const response = await apiRequest('POST', '/api/seller-profiles', data);
      if (!response.ok) {
        throw new Error('Failed to create seller profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Created!",
        description: "Your seller profile has been created successfully.",
      });
      setActiveTab('media');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create seller profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const weekDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const soilTypeOptions = [
    { value: 'loam', label: 'Loam' },
    { value: 'clay', label: 'Clay' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'custom', label: 'Custom' }
  ];

  const lightConditionOptions = [
    { value: 'full_sun', label: 'Full Sun (6+ hours)' },
    { value: 'partial_shade', label: 'Partial Shade (3-6 hours)' },
    { value: 'mostly_shaded', label: 'Mostly Shaded (<3 hours)' },
    { value: 'custom', label: 'Custom' }
  ];

  const irrigationOptions = [
    { value: 'manual', label: 'Manual watering needed' },
    { value: 'automated', label: 'Automated watering system' },
    { value: 'natural', label: 'Natural water source' }
  ];

  const managementOptions = [
    { value: 'hands_off', label: 'Fully hands-off' },
    { value: 'daily_visit', label: 'One visit per day' },
    { value: 'multiple_visits', label: 'Multiple daily visits' }
  ];

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addFarmSpace = (data: FarmSpaceFormData) => {
    setFarmSpaces(prev => [...prev, data]);
    farmSpaceForm.reset();
    toast({
      title: "Farm Space Added",
      description: "Farm space has been added to your profile.",
    });
  };

  const removeFarmSpace = (index: number) => {
    setFarmSpaces(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmitProfile = (data: SellerProfileFormData) => {
    createProfileMutation.mutate(data);
  };

  const onSubmitFarmSpace = (data: FarmSpaceFormData) => {
    addFarmSpace(data);
  };

  return (
    <>
      <Helmet>
        <title>Setup Seller Profile | FarmDirect</title>
        <meta name="description" content="Create your seller profile to start selling fresh produce and offering farm spaces on FarmDirect." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Seller Profile</h1>
            <p className="text-gray-600">Create a comprehensive profile to showcase your farm and attract customers</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Farm Details</TabsTrigger>
              <TabsTrigger value="media">Media Gallery</TabsTrigger>
              <TabsTrigger value="farm-spaces">Farm Spaces</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Farm Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="farmName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Sunny Acres Farm" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be displayed as your main farm name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Description *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell customers about your farm, growing practices, and what makes your produce special..."
                                  className="min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Farm Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Farm Road, City, State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="locationVisibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location Sharing Preference</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="full" id="full" />
                                    <Label htmlFor="full">Show full address</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="area" id="area" />
                                    <Label htmlFor="area">Show neighborhood/area only</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="city" id="city" />
                                    <Label htmlFor="city">Show city only</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormDescription>
                                Optional - customers can contact you by phone
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="contactVisibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Preference</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select contact preference" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">Email only</SelectItem>
                                    <SelectItem value="phone">Phone only</SelectItem>
                                    <SelectItem value="both">Both email and phone</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="operationalDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operating Days *</FormLabel>
                              <FormDescription>
                                Select the days when customers can contact you or pick up orders
                              </FormDescription>
                              <div className="grid grid-cols-2 gap-4">
                                {weekDays.map((day) => (
                                  <div key={day.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={day.id}
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, day.id]);
                                        } else {
                                          field.onChange(field.value?.filter((d) => d !== day.id));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={day.id}>{day.label}</Label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="operationalHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operating Hours *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 8:00 AM - 6:00 PM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full" disabled={createProfileMutation.isPending}>
                          {createProfileMutation.isPending ? "Creating Profile..." : "Create Seller Profile"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Media Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Farm Photos & Videos</h3>
                      <p className="text-gray-600 mb-4">Show customers your farm, growing practices, and products</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        className="hidden"
                        id="media-upload"
                      />
                      <Label htmlFor="media-upload">
                        <Button variant="outline" className="cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                      </Label>
                    </div>

                    {mediaFiles.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Selected Files ({mediaFiles.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {mediaFiles.map((file, index) => (
                            <div key={index} className="relative border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedia(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500">
                                {file.type.startsWith('image/') ? 'Image' : 'Video'} • {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button onClick={() => setActiveTab('farm-spaces')} className="w-full">
                      Continue to Farm Spaces
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="farm-spaces">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Farm Space Sharing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Offer parts of your land for other farmers or gardeners to use. This is optional but can provide additional income.
                      </p>
                      
                      <Form {...farmSpaceForm}>
                        <form onSubmit={farmSpaceForm.handleSubmit(onSubmitFarmSpace)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={farmSpaceForm.control}
                              name="squareFootage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Square Footage</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="e.g., 100"
                                      {...field}
                                      onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={farmSpaceForm.control}
                              name="soilType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Soil Type</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select soil type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {soilTypeOptions.map(option => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={farmSpaceForm.control}
                              name="lightConditions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Light Conditions</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select light conditions" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {lightConditionOptions.map(option => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={farmSpaceForm.control}
                              name="irrigationOptions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Irrigation</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select irrigation type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {irrigationOptions.map(option => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={farmSpaceForm.control}
                            name="managementLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Management Level</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select management level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {managementOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={farmSpaceForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0.00"
                                      step="0.01"
                                      {...field}
                                      onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={farmSpaceForm.control}
                              name="pricingType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pricing Type</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select pricing type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="seasonal">Seasonal</SelectItem>
                                        <SelectItem value="flat">Flat Rate</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={farmSpaceForm.control}
                            name="additionalNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Any special rules, requirements, or additional information..."
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Farm Space
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  {farmSpaces.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Added Farm Spaces ({farmSpaces.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {farmSpaces.map((space, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">Farm Space {index + 1}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFarmSpace(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Size:</span> {space.squareFootage} sq ft
                                </div>
                                <div>
                                  <span className="text-gray-600">Soil:</span> {space.soilType}
                                </div>
                                <div>
                                  <span className="text-gray-600">Light:</span> {space.lightConditions}
                                </div>
                                <div>
                                  <span className="text-gray-600">Price:</span> ${space.price}/{space.pricingType}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={() => setActiveTab('preview')} className="w-full">
                    Preview Profile
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Profile Setup Complete!</h3>
                      <p className="text-gray-600 mb-6">
                        Your seller profile is ready. You can now start listing products and offering farm spaces.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate('/profile')}>
                          View Profile
                        </Button>
                        <Button onClick={() => navigate('/create-listing')}>
                          Create First Listing
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}