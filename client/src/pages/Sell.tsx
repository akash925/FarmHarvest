// client/src/pages/Sell.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { Package, Truck, DollarSign, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const quickListingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  price: z.string().min(1, "Price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type QuickListingForm = z.infer<typeof quickListingSchema>;

export default function Sell() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [hasFarm, setHasFarm] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // we'll create the form only when the user is authenticated & has a farm to avoid hook-count mismatch
  const form = useForm<QuickListingForm>({
    resolver: zodResolver(quickListingSchema),
    defaultValues: {
      title: "",
      price: "",
      quantity: "",
      unit: "",
      description: "",
    },
  });

  // 1) Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // 2) Redirect to /login if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null; // no hooks below will run
  }

  // 3) Once authenticated, check if user has a seller profile
  useEffect(() => {
    if (!user) return;
    
    (async () => {
      try {
        const res = await fetch(`/api/seller-profiles/${user.id}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (res.ok) {
          setHasFarm(true);
        } else {
          setHasFarm(false);
        }
      } catch (err) {
        console.error("Error fetching seller profile:", err);
        setHasFarm(false);
      }
    })();
  }, [user]);

  // 4) While we don't yet know if they have a seller profile, show spinner
  if (hasFarm === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  // 5) If user has no seller profile, prompt them to create one
  if (hasFarm === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Helmet>
          <title>Create Seller Profile - FarmDirect</title>
          <meta name="description" content="Create your seller profile to start selling fresh produce directly to customers." />
        </Helmet>
        
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto mt-12">
            <CardHeader>
              <CardTitle className="text-center">Create Your Seller Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                You need a seller profile before you can sell produce. This helps customers learn about your farm and builds trust.
              </p>
              <div className="space-y-3">
                <Button onClick={() => setLocation("/seller-profile-setup")} className="w-full">
                  Create Seller Profile
                </Button>
                <Button variant="outline" onClick={() => setLocation("/")} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: QuickListingForm) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const listingData = {
        title: data.title,
        description: data.description,
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        quantity: parseInt(data.quantity),
        unit: data.unit,
        category: "produce", // default category
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create listing');
      }

      const result = await response.json();
      setSubmitSuccess(true);
      form.reset();
      setTimeout(() => setSubmitSuccess(false), 1500);
      // navigate directly to the new listing detail
      if (result?.listing?.id) {
        setLocation(`/listings/${result.listing.id}`);
      }
    } catch (error) {
      console.error('Create listing error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6) Authenticated + has farm → render the Sell form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Helmet>
        <title>Seller Dashboard - FarmDirect</title>
        <meta name="description" content="Manage your farm listings, orders, and customer communications on FarmDirect." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome Back, {user?.name}!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Create New Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">List your fresh produce for sale</p>
                <Button onClick={() => setLocation("/listings/new")} className="w-full">
                  Add Product
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>My Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage your existing products</p>
                <Button variant="outline" onClick={() => setLocation("/listings")} className="w-full">
                  View Listings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Seller Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Update your farm information</p>
                <Button variant="outline" onClick={() => setLocation(`/seller-profile/${user?.id}`)} className="w-full">
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="w-8 h-8 text-orange-600 mb-2" />
                <CardTitle>Farm Spaces</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Rent out farm space to other growers</p>
                <Button variant="outline" onClick={() => setLocation("/farm-spaces")} className="w-full">
                  Manage Spaces
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View and manage customer orders</p>
                <Button variant="outline" onClick={() => setLocation("/orders")} className="w-full">
                  View Orders
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track your sales performance</p>
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Listing Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tomatoes, Apples, Eggs…" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Unit ($)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="e.g. 2.50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity Available</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g. 50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Type</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="lbs, pieces, bunches" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Describe your produce..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {submitError && (
                    <Alert variant="destructive">
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  {submitSuccess && (
                    <Alert>
                      <AlertDescription>✅ Listing created successfully!</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Listing..." : "Publish Listing"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}