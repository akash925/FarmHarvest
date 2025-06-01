import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const sellerProfileSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  operationalHours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
  contactVisibility: z.enum(["phone", "email", "both"]),
  locationVisibility: z.enum(["full", "area", "city"]),
});

type SellerProfileData = z.infer<typeof sellerProfileSchema>;

export default function SellerOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const form = useForm<SellerProfileData>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      farmName: "",
      bio: "",
      address: "",
      phone: "",
      email: "",
      operationalHours: {
        monday: "9:00 AM - 5:00 PM",
        tuesday: "9:00 AM - 5:00 PM",
        wednesday: "9:00 AM - 5:00 PM",
        thursday: "9:00 AM - 5:00 PM",
        friday: "9:00 AM - 5:00 PM",
        saturday: "9:00 AM - 3:00 PM",
        sunday: "Closed",
      },
      contactVisibility: "email",
      locationVisibility: "city",
    },
  });

  const createSellerProfile = useMutation({
    mutationFn: async (data: SellerProfileData) => {
      const response = await apiRequest("POST", "/api/seller-profiles", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create seller profile");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your seller profile has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/seller-profiles"] });
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SellerProfileData) => {
    setIsLoading(true);
    try {
      await createSellerProfile.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Your Seller Profile
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Set up your farm profile to start selling produce and renting farm spaces
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="farmName">Farm Name *</Label>
              <Input
                id="farmName"
                {...form.register("farmName")}
                placeholder="e.g., Sunny Acres Farm"
              />
              {form.formState.errors.farmName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.farmName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About Your Farm *</Label>
              <Textarea
                id="bio"
                {...form.register("bio")}
                placeholder="Tell customers about your farming practices, specialties, and what makes your farm unique..."
                rows={4}
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Farm Address *</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="123 Farm Road, City, State, ZIP"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="(555) 123-4567"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="farm@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Contact Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-contact"
                    checked={form.watch("contactVisibility") === "email" || form.watch("contactVisibility") === "both"}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("contactVisibility");
                      if (checked) {
                        form.setValue("contactVisibility", current === "phone" ? "both" : "email");
                      } else {
                        form.setValue("contactVisibility", "phone");
                      }
                    }}
                  />
                  <Label htmlFor="email-contact">Show email to customers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phone-contact"
                    checked={form.watch("contactVisibility") === "phone" || form.watch("contactVisibility") === "both"}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("contactVisibility");
                      if (checked) {
                        form.setValue("contactVisibility", current === "email" ? "both" : "phone");
                      } else {
                        form.setValue("contactVisibility", "email");
                      }
                    }}
                  />
                  <Label htmlFor="phone-contact">Show phone to customers</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Location Privacy</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="city-only"
                    value="city"
                    {...form.register("locationVisibility")}
                  />
                  <Label htmlFor="city-only">Show city only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="area-only"
                    value="area"
                    {...form.register("locationVisibility")}
                  />
                  <Label htmlFor="area-only">Show general area</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="full-address"
                    value="full"
                    {...form.register("locationVisibility")}
                  />
                  <Label htmlFor="full-address">Show full address</Label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || createSellerProfile.isPending}
            >
              {isLoading || createSellerProfile.isPending ? "Creating Profile..." : "Create Seller Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}