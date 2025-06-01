import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Package, ShoppingCart, Star, TrendingUp, MapPin, 
  Calendar, MessageCircle, Heart, Bell, Settings,
  DollarSign, Users, Clock, Award
} from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

export default function UserDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user data - in real app, this would come from authentication context
  const userData = {
    id: 3,
    name: "Akash",
    email: "akash.agarwal@conmitto.io",
    location: "Santa Monica, CA 90403",
    memberSince: "2024",
    avatar: null,
    stats: {
      totalPurchases: 24,
      totalSpent: 847,
      favoriteVendors: 8,
      reviewsGiven: 12,
      avgOrderValue: 35.29
    }
  };

  const { data: recentOrders } = useQuery({
    queryKey: ['/api/orders/recent'],
    enabled: false // Disable until authentication is working
  });

  const { data: favoriteVendors } = useQuery({
    queryKey: ['/api/users/favorites'],
    enabled: false
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: false
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>My Dashboard - FarmDirect</title>
        <meta name="description" content="Manage your orders, track deliveries, and discover new local farmers on your personalized dashboard." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {userData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {userData.name}!
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {userData.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Member since {userData.memberSince}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userData.stats.totalPurchases}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">${userData.stats.totalSpent}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userData.stats.favoriteVendors}</div>
                <div className="text-sm text-gray-600">Favorite Farms</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userData.stats.reviewsGiven}</div>
                <div className="text-sm text-gray-600">Reviews Given</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">${userData.stats.avgOrderValue}</div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="recommendations">For You</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">Order delivered</p>
                          <p className="text-sm text-gray-600">Fresh tomatoes from Sunny Acres Farm</p>
                        </div>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">Review submitted</p>
                          <p className="text-sm text-gray-600">5-star review for Green Valley Produce</p>
                        </div>
                        <span className="text-sm text-gray-500">1 day ago</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">New farmer followed</p>
                          <p className="text-sm text-gray-600">Now following Organic Herbs Co.</p>
                        </div>
                        <span className="text-sm text-gray-500">3 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => navigate('/marketplace-map')}
                      >
                        <MapPin className="h-6 w-6" />
                        Browse Map
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => navigate('/listings')}
                      >
                        <Package className="h-6 w-6" />
                        Shop Produce
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => navigate('/farm-spaces')}
                      >
                        <Users className="h-6 w-6" />
                        Find Farm Space
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col gap-2"
                        onClick={() => navigate('/orders')}
                      >
                        <ShoppingCart className="h-6 w-6" />
                        Track Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Seasonal Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Seasonal Picks Near You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-red-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Summer Tomatoes</h3>
                      <p className="text-sm text-gray-600 mb-2">Peak season, locally grown</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">In Season</Badge>
                        <span className="font-bold">$4.99/lb</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-green-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Fresh Herbs</h3>
                      <p className="text-sm text-gray-600 mb-2">Basil, cilantro, parsley</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Popular</Badge>
                        <span className="font-bold">$2.99/bunch</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-purple-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Stone Fruits</h3>
                      <p className="text-sm text-gray-600 mb-2">Peaches, plums, apricots</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Limited</Badge>
                        <span className="font-bold">$6.99/lb</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Your order history will appear here
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start shopping to see your orders and track deliveries
                    </p>
                    <Button onClick={() => navigate('/listings')}>
                      Browse Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Farms & Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Save your favorite farms and products for easy access
                    </p>
                    <Button onClick={() => navigate('/marketplace-map')}>
                      Discover Farms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Personalized recommendations coming soon
                    </h3>
                    <p className="text-gray-500 mb-4">
                      We'll suggest products based on your preferences and purchase history
                    </p>
                    <Button onClick={() => navigate('/listings')}>
                      Explore All Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}