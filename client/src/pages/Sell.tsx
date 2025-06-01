import { useAuth } from "@/lib/auth-simple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Package, Truck, DollarSign, Users } from "lucide-react";

export default function Sell() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [, navigate] = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Helmet>
          <title>Start Selling - FarmDirect</title>
          <meta name="description" content="Join our marketplace and start selling your farm produce directly to customers. Create your seller profile and list your products today." />
        </Helmet>
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Start Selling Your Farm Produce
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Join thousands of farmers connecting directly with customers. Set your own prices, build relationships, and grow your business.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardHeader>
                  <Package className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">List Your Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Upload photos and descriptions of your fresh produce</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Set Your Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Keep more profit with direct-to-customer sales</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Build Relationships</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Connect directly with customers who value fresh, local produce</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Truck className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Flexible Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Offer pickup, delivery, or farm visits</p>
                </CardContent>
              </Card>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Ready to Get Started?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Create your free account and seller profile to start listing your produce today.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate("/auth")} 
                    className="w-full"
                    size="lg"
                  >
                    Sign Up to Start Selling
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/auth")} 
                    className="w-full"
                  >
                    Already have an account? Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated - show seller dashboard or onboarding
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Seller Dashboard - FarmDirect</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">List your fresh produce for sale</p>
              <Button onClick={() => navigate("/listings/new")} className="w-full">
                Add Product
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your existing products</p>
              <Button variant="outline" onClick={() => navigate("/listings")} className="w-full">
                View Listings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Update your farm information</p>
              <Button variant="outline" onClick={() => navigate("/profile")} className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farm Spaces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Rent out farm space to other growers</p>
              <Button variant="outline" onClick={() => navigate("/farm-spaces")} className="w-full">
                Manage Spaces
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and manage customer orders</p>
              <Button variant="outline" onClick={() => navigate("/orders")} className="w-full">
                View Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
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
      </div>
    </div>
  );
}