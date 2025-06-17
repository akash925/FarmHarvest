import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/cleanAuth";
import ListingCard from "@/components/ListingCard";

// Mock data for development only - will be replaced with real data
const sampleMedia = [
  {
    id: 1,
    mediaType: "photo" as const,
    url: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGZhcm18ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    caption: "Beautiful spring fields ready for planting",
  },
  {
    id: 2,
    mediaType: "photo" as const,
    url: "https://images.unsplash.com/photo-1530507629858-e3759c1ee136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGZhcm18ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    caption: "Fresh organic produce from our farm",
  },
  {
    id: 3,
    mediaType: "photo" as const,
    url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGZhcm18ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    caption: "Happy chickens laying fresh eggs daily",
  },
  {
    id: 4, 
    mediaType: "video" as const,
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    caption: "Tour of our sustainable farming practices",
  },
];

interface SellerProfileData {
  user: User;
  profile: {
    id: number;
    userId: number;
    farmName: string;
    bio: string;
    address: string | null;
    locationVisibility: string;
    phone: string | null;
    contactVisibility: string;
    operationalHours: {
      days: string[];
      hours: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  media: Array<{
    id: number;
    mediaType: 'photo' | 'video';
    url: string;
    caption: string;
  }>;
  farmSpaces: Array<{
    id: number;
    squareFootage: number;
    soilType: string;
    lightConditions: string;
    irrigationOptions: string;
    managementLevel: string;
    price: number;
    pricingType: string;
    status: string;
    additionalNotes: string | null;
  }>;
  listings: Array<{
    id: number;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
  }>;
}

export default function EnhancedSellerProfile() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Debug logging
  console.log('EnhancedSellerProfile - id:', id, 'currentUser:', currentUser);
  
  // Fetch seller profile data
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['/api/seller-profiles', id],
    queryFn: async () => {
      try {
        console.log('Fetching seller profile for id:', id);
        // First check if profile exists
        const response = await fetch(`/api/seller-profiles/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Seller profile data:', data);
          return data;
        }
        
        // If profile doesn't exist but we're looking at our own profile, show setup option
        if (response.status === 404 && currentUser && currentUser.id === parseInt(id || '0')) {
          console.log('Profile not found for current user, returning null');
          return null;
        }
        
        console.error('Failed to load seller profile, status:', response.status);
        throw new Error("Failed to load seller profile");
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
  
  const { data: userData } = useQuery({
    queryKey: ['/api/users', id],
    queryFn: async () => {
      console.log('Fetching user data for id:', id);
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        console.error('Failed to load user data, status:', response.status);
        throw new Error("Failed to load user data");
      }
      const data = await response.json();
      console.log('User data:', data);
      return data;
    },
    enabled: !!id,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Profile</CardTitle>
            <CardDescription>
              We encountered an error while loading this seller profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact support if the problem persists.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If no profile exists yet but it's the current user
  if (!profileData && currentUser && currentUser.id === parseInt(id || '0')) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Enhanced Seller Profile</CardTitle>
            <CardDescription>
              You haven't set up your enhanced seller profile yet. Create one to showcase your farm and available spaces!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-md space-y-2">
              <h3 className="font-medium">With an enhanced profile you can:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Showcase your farm with photos and videos</li>
                <li>Share details about your farming practices</li>
                <li>Offer farm space for others to use</li>
                <li>Set your contact preferences and operational hours</li>
                <li>Build trust with potential customers</li>
              </ul>
            </div>
            
            <Button onClick={() => navigate("/seller-profile-setup")} size="lg" className="w-full">
              Set Up Your Enhanced Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Using real data if available, otherwise fallback to mock data
  const sellerData = profileData || {
    user: userData?.user,
    profile: {
      farmName: userData?.user.name + "'s Farm",
      bio: "This farmer hasn't created an enhanced profile yet.",
      operationalHours: { days: [], hours: "" },
    },
    media: [],
    farmSpaces: [],
    listings: [],
  };
  
  // Using the fetched user data as a fallback if needed
  const user = sellerData.user || userData?.user;
  
  // If neither profile nor user data is available
  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Seller Not Found</CardTitle>
            <CardDescription>
              We couldn't find this seller in our system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="mt-4">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Display the profile
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
          {user.image ? (
            <img 
              src={user.image} 
              alt={user.name || "Seller"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
              {(user.name || "S")[0].toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {sellerData.profile?.farmName || user.name + "'s Farm"}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Verified Seller
            </Badge>
            {user.productsGrown && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {user.productsGrown.split(',')[0].trim()} Grower
              </Badge>
            )}
            {user.zip && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {user.zip}
              </Badge>
            )}
          </div>
          
          <p className="text-slate-600 mb-4">
            {sellerData.profile?.bio || user.about || "This seller hasn't added a bio yet."}
          </p>
          
          {currentUser && currentUser.id === parseInt(id || '0') ? (
            <Button onClick={() => navigate("/farm-profile-edit")}>
              {sellerData.profile ? "Edit Profile" : "Create Enhanced Profile"}
            </Button>
          ) : (
            <Button onClick={() => navigate(`/messages?recipient=${user.id}`)}>Contact Seller</Button>
          )}
        </div>
      </div>
      
      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Products</TabsTrigger>
          <TabsTrigger value="spaces">Farm Spaces</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>Information about this farm and its practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Products Grown */}
              <div>
                <h3 className="font-medium mb-2">Products Grown</h3>
                <div className="flex flex-wrap gap-2">
                  {user.productsGrown ? (
                    user.productsGrown.split(',').map((product: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-800">
                        {product.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-500">No products listed</p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Operational Hours */}
              <div>
                <h3 className="font-medium mb-2">Operational Hours</h3>
                {sellerData.profile?.operationalHours?.days?.length > 0 ? (
                  <div>
                    <p className="font-medium">{sellerData.profile.operationalHours.hours}</p>
                    <p className="text-slate-600">
                      {sellerData.profile.operationalHours.days.join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500">Hours not specified</p>
                )}
              </div>
              
              <Separator />
              
              {/* Location */}
              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <p className="text-slate-600">
                  {sellerData.profile?.locationVisibility === 'full' && sellerData.profile.address
                    ? sellerData.profile.address
                    : sellerData.profile?.locationVisibility === 'area' && sellerData.profile.address
                    ? sellerData.profile.address.split(',').slice(1).join(',').trim()
                    : user.zip || "Location not specified"}
                </p>
              </div>
              
              {user.about && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-slate-600">{user.about}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Featured Products Preview */}
          {sellerData.listings && sellerData.listings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>Current offerings from this farm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerData.listings.slice(0, 3).map((listing: any) => (
                    <div key={listing.id} className="border rounded-md overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={listing.imageUrl || "https://images.unsplash.com/photo-1553531384-cc64ac80f931"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{listing.title}</h3>
                        <p className="text-primary font-bold">
                          ${(listing.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab("listings")}
                >
                  View All Products
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Farm Spaces Preview */}
          {sellerData.farmSpaces && sellerData.farmSpaces.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Farm Spaces</CardTitle>
                <CardDescription>Land available for gardening or farming</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sellerData.farmSpaces.slice(0, 2).map((space: any) => (
                    <div key={space.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {space.squareFootage} sq ft - {space.soilType} soil
                          </h3>
                          <p className="text-slate-600">
                            {space.lightConditions?.replace(/_/g, ' ') || 'Unknown'} · {space.irrigationOptions?.replace(/_/g, ' ') || 'Unknown'} irrigation
                          </p>
                        </div>
                        <Badge className={space.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                          {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-primary">
                          ${(space.price / 100).toFixed(2)}/{space.pricingType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab("spaces")}
                >
                  View All Farm Spaces
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Products for Sale</CardTitle>
              <CardDescription>
                Fresh produce and products from {sellerData.profile?.farmName || user.name + "'s Farm"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sellerData.listings && sellerData.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellerData.listings.map((listing: any) => (
                    <div key={listing.id} className="border rounded-md overflow-hidden">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={listing.imageUrl || "https://images.unsplash.com/photo-1553531384-cc64ac80f931"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{listing.title}</h3>
                          <Badge variant="outline">{listing.category}</Badge>
                        </div>
                        <p className="text-primary font-bold mb-3">
                          ${(listing.price / 100).toFixed(2)}
                        </p>
                        <Button 
                          onClick={() => navigate(`/listings/${listing.id}`)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium mb-2">No Products Listed</h3>
                  <p className="text-slate-500 mb-4">
                    This seller doesn't have any products listed at the moment.
                  </p>
                  {currentUser && currentUser.id === parseInt(id) && (
                    <Button onClick={() => navigate("/listings/new")}>
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Farm Spaces Tab */}
        <TabsContent value="spaces">
          <Card>
            <CardHeader>
              <CardTitle>Available Farm Spaces</CardTitle>
              <CardDescription>
                Rent space on {sellerData.profile?.farmName || user.name + "'s land"} to grow your own produce
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sellerData.farmSpaces && sellerData.farmSpaces.length > 0 ? (
                <div className="space-y-6">
                  {/* Spaces list */}
                  {sellerData.farmSpaces.map((space) => (
                    <Card key={space.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Space visualizer */}
                          <div className="w-full md:w-1/3 h-48 bg-slate-100 rounded-md flex items-center justify-center">
                            <div 
                              className="w-3/4 h-3/4 border-2 border-dashed border-slate-300 flex items-center justify-center"
                              style={{ 
                                backgroundColor: 
                                  space.soilType === 'loam' ? '#c9b18c' : 
                                  space.soilType === 'clay' ? '#d15e2b' : 
                                  space.soilType === 'sandy' ? '#e6d3a7' : '#d8cca3' 
                              }}
                            >
                              <span className="text-lg font-medium text-white text-center">
                                {space.squareFootage} sq ft
                              </span>
                            </div>
                          </div>
                          
                          {/* Space details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-xl font-medium">
                                {space.squareFootage} sq ft Farm Plot
                              </h3>
                              <Badge className={space.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div>
                                <span className="text-slate-500 text-sm">Soil Type</span>
                                <p className="font-medium capitalize">{space.soilType}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-sm">Light Conditions</span>
                                <p className="font-medium capitalize">{space.lightConditions?.replace(/_/g, ' ') || 'Unknown'}</p>
                              </div>
                                                              <div>
                                  <span className="text-slate-500 text-sm">Irrigation</span>
                                  <p className="font-medium capitalize">{space.irrigationOptions?.replace(/_/g, ' ') || 'Unknown'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-sm">Management Level</span>
                                  <p className="font-medium capitalize">{space.managementLevel?.replace(/_/g, ' ') || 'Unknown'}</p>
                                </div>
                            </div>
                            
                            {space.additionalNotes && (
                              <div className="mb-4">
                                <span className="text-slate-500 text-sm">Additional Notes</span>
                                <p className="text-slate-600">{space.additionalNotes}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-slate-500 text-sm">Price</span>
                                <p className="text-2xl font-bold text-primary">
                                  ${(space.price / 100).toFixed(2)}
                                  <span className="text-base font-normal text-slate-500">/{space.pricingType}</span>
                                </p>
                              </div>
                              
                              {space.status === 'available' && currentUser && currentUser.id !== parseInt(id) && (
                                <Button onClick={() => {
                                  toast({
                                    title: "Interest Submitted",
                                    description: "The farm owner will be notified of your interest in this space.",
                                  });
                                }}>
                                  Rent This Space
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium mb-2">No Farm Spaces Available</h3>
                  <p className="text-slate-500 mb-4">
                    This seller doesn't have any farm spaces listed for rent.
                  </p>
                  {currentUser && currentUser.id === parseInt(id) && (
                    <Button onClick={() => navigate("/farm-spaces/new")}>
                      Add Farm Spaces
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Farm Gallery</CardTitle>
              <CardDescription>
                Photos and videos from {sellerData.profile?.farmName || user.name + "'s Farm"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(sellerData.media && sellerData.media.length > 0) || (currentUser && currentUser.id !== parseInt(id)) ? (
                <div className="space-y-8">
                  {/* Photos */}
                  <div>
                    <h3 className="font-medium mb-4">Photos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(sellerData.media?.length > 0 
                        ? sellerData.media.filter(m => m.mediaType === 'photo')
                        : sampleMedia.filter(m => m.mediaType === 'photo')
                      ).map((media) => (
                        <div key={media.id} className="rounded-md overflow-hidden">
                          <img
                            src={media.url}
                            alt={media.caption || "Farm photo"}
                            className="w-full h-48 object-cover"
                          />
                          {media.caption && (
                            <p className="p-2 text-sm text-slate-600">{media.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Videos */}
                  {((sellerData.media?.some(m => m.mediaType === 'video')) || 
                     (sampleMedia.some(m => m.mediaType === 'video'))) && (
                    <div>
                      <h3 className="font-medium mb-4">Videos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(sellerData.media?.length > 0 
                          ? sellerData.media.filter(m => m.mediaType === 'video')
                          : sampleMedia.filter(m => m.mediaType === 'video')
                        ).map((media) => (
                          <div key={media.id} className="rounded-md overflow-hidden">
                            <div className="aspect-video">
                              <iframe
                                src={media.url}
                                title={media.caption || "Farm video"}
                                className="w-full h-full"
                                allowFullScreen
                              ></iframe>
                            </div>
                            {media.caption && (
                              <p className="p-2 text-sm text-slate-600">{media.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium mb-2">No Media Added</h3>
                  <p className="text-slate-500 mb-4">
                    This seller hasn't added any photos or videos yet.
                  </p>
                  {currentUser && currentUser.id === parseInt(id) && (
                    <Button onClick={() => navigate("/seller-profile-setup")}>
                      Add Media to Your Profile
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}