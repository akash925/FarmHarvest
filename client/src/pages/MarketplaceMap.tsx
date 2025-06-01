import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Navigation, Clock, Phone, Star } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Listing, FarmSpace } from "@shared/schema";

interface MapLocation {
  id: number;
  title: string;
  category: string;
  price: number;
  location: string;
  distance: number;
  type: 'listing' | 'farmspace';
  seller: {
    name: string;
    rating: number;
    responseTime: string;
  };
  availableUntil?: string;
}

export default function MarketplaceMap() {
  const [, navigate] = useLocation();
  const [userZip, setUserZip] = useState("90403");
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { data: listingsData } = useQuery<{ listings: Listing[] }>({
    queryKey: ['/api/listings'],
  });

  const { data: farmSpacesData } = useQuery<{ farmSpaces: FarmSpace[] }>({
    queryKey: ['/api/farm-spaces'],
  });

  // Transform data for map display
  const mapLocations: MapLocation[] = [
    ...(listingsData?.listings || []).map(listing => ({
      id: listing.id,
      title: listing.title,
      category: listing.category,
      price: listing.price,
      location: `${listing.location || "Local Area"}`,
      distance: Math.floor(Math.random() * 20) + 1, // Simulated distance
      type: 'listing' as const,
      seller: {
        name: "Local Farmer", // In real app, join with user data
        rating: 4.5 + Math.random() * 0.5,
        responseTime: "Usually responds within 2 hours"
      }
    })),
    ...(farmSpacesData?.farmSpaces || []).map(space => ({
      id: space.id,
      title: space.title || "Farm Space",
      category: "Farm Space",
      price: space.pricePerMonth || 0,
      location: space.location || "Local Area",
      distance: Math.floor(Math.random() * 30) + 1,
      type: 'farmspace' as const,
      seller: {
        name: "Space Owner",
        rating: 4.2 + Math.random() * 0.8,
        responseTime: "Usually responds within 4 hours"
      },
      availableUntil: space.availableUntil
    }))
  ];

  // Filter and sort locations
  const filteredLocations = mapLocations
    .filter(location => {
      if (selectedCategory !== "all" && location.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      return location.distance <= searchRadius;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.seller.rating - a.seller.rating;
        default:
          return 0;
      }
    });

  const categories = ["all", ...Array.from(new Set(mapLocations.map(loc => loc.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Local Marketplace Map - FarmDirect</title>
        <meta name="description" content="Discover fresh produce and farm spaces near you with our interactive marketplace map. Find local farmers, compare prices, and get directions." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Local Marketplace Map
            </h1>
            <p className="text-gray-600">
              Discover fresh produce and farm spaces within {searchRadius} miles of {userZip}
            </p>
          </div>

          {/* Search and Filter Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter ZIP code"
                      value={userZip}
                      onChange={(e) => setUserZip(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Search Radius</label>
                  <Select value={searchRadius.toString()} onValueChange={(v) => setSearchRadius(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Update Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Found {filteredLocations.length} results within {searchRadius} miles
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={viewMode} className="space-y-6">
            {/* List View */}
            <TabsContent value="list">
              <div className="grid gap-4">
                {filteredLocations.map((location) => (
                  <Card key={`${location.type}-${location.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{location.title}</h3>
                            <Badge variant={location.type === 'listing' ? 'default' : 'secondary'}>
                              {location.type === 'listing' ? 'For Sale' : 'For Lease'}
                            </Badge>
                            <Badge variant="outline">{location.category}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{location.location} • {location.distance} miles away</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{location.seller.rating.toFixed(1)} rating</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{location.seller.responseTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <span>Sold by {location.seller.name}</span>
                          </div>

                          {location.availableUntil && (
                            <div className="text-sm text-orange-600 mb-3">
                              Available until {new Date(location.availableUntil).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-green-600 mb-2">
                            ${location.price}
                            {location.type === 'farmspace' && <span className="text-sm font-normal">/month</span>}
                          </p>
                          <div className="space-y-2">
                            <Button 
                              onClick={() => navigate(location.type === 'listing' ? `/listings/${location.id}` : `/farm-spaces/${location.id}`)}
                              className="w-full"
                            >
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              <Navigation className="h-4 w-4 mr-1" />
                              Directions
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredLocations.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Try expanding your search radius or selecting different categories.
                      </p>
                      <Button onClick={() => setSearchRadius(50)}>
                        Expand to 50 miles
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Map View */}
            <TabsContent value="map">
              <Card>
                <CardContent className="p-6">
                  <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Interactive Map Integration
                      </h3>
                      <p className="text-gray-500 max-w-md mb-4">
                        We're working on integrating mapping services to show exact locations. 
                        This would display pins for each farm and produce location with detailed popup information.
                      </p>
                      <div className="text-sm text-gray-400">
                        Would you like me to integrate with a mapping service like Google Maps or Mapbox?
                      </div>
                    </div>
                    
                    {/* Simulated location pins */}
                    {filteredLocations.slice(0, 5).map((location, index) => (
                      <div
                        key={location.id}
                        className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer ${
                          location.type === 'listing' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{
                          top: `${20 + (index * 15)}%`,
                          left: `${30 + (index * 10)}%`,
                        }}
                        title={`${location.title} - $${location.price}`}
                      />
                    ))}
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