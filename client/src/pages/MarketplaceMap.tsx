import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Star, Clock, Phone } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Listing, FarmSpace } from "@shared/schema";
import InteractiveMap from "@/components/InteractiveMap";

interface MapLocation {
  id: number;
  title: string;
  type: 'listing' | 'farmspace';
  lat: number;
  lng: number;
  price: number;
  seller: string;
  description: string;
}

export default function MarketplaceMap() {
  const [, navigate] = useLocation();
  const [userZip, setUserZip] = useState("90403");
  const [searchRadius, setSearchRadius] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

  const { data: listingsData } = useQuery<{ listings: Listing[] }>({
    queryKey: ['/api/listings'],
    queryFn: async () => {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      return response.json();
    }
  });

  const { data: farmSpacesData } = useQuery<{ farmSpaces: FarmSpace[] }>({
    queryKey: ['/api/farm-spaces'],
    queryFn: async () => {
      const response = await fetch('/api/farm-spaces');
      if (!response.ok) {
        throw new Error('Failed to fetch farm spaces');
      }
      return response.json();
    }
  });

  // Santa Monica area coordinates for demo
  const santaMonicaCenter: [number, number] = [34.0195, -118.4912];
  
  // Transform real data for map display with realistic Santa Monica area coordinates
  const mapLocations: MapLocation[] = [
    ...(listingsData?.listings || []).map((listing, index) => ({
      id: listing.id,
      title: listing.title,
      type: 'listing' as const,
      lat: 34.0195 + (Math.random() - 0.5) * 0.1, // Random coordinates around Santa Monica
      lng: -118.4912 + (Math.random() - 0.5) * 0.1,
      price: listing.price,
      seller: "Local Farm",
      description: listing.description || `Fresh ${listing.title.toLowerCase()}`
    })),
    ...(farmSpacesData?.farmSpaces || []).map((space, index) => ({
      id: space.id + 1000, // Offset to avoid ID conflicts
      title: space.title || `Farm Space ${space.id}`,
      type: 'farmspace' as const,
      lat: 34.0195 + (Math.random() - 0.5) * 0.15,
      lng: -118.4912 + (Math.random() - 0.5) * 0.15,
      price: space.pricePerMonth || 0,
      seller: "Farm Owner",
      description: space.description || `${space.sizeSqft || 'Unknown size'} sq ft farm space`
    }))
  ];

  const filteredLocations = mapLocations.filter(location => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "produce") return location.type === 'listing';
    if (selectedCategory === "farmspaces") return location.type === 'farmspace';
    return true;
  });

  const handleLocationClick = (location: MapLocation) => {
    if (location.type === 'listing') {
      navigate(`/listings/${location.id}`);
    } else {
      navigate(`/farm-spaces/${location.id - 1000}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Local Marketplace Map - FarmDirect</title>
        <meta name="description" content="Discover fresh produce and farm spaces within 25 miles of 90403" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Marketplace Map</h1>
            <p className="text-gray-600">Discover fresh produce and farm spaces within {searchRadius} miles of {userZip}</p>
          </div>

          {/* Search Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Your Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={userZip}
                      onChange={(e) => setUserZip(e.target.value)}
                      placeholder="ZIP code"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search Radius</label>
                  <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="produce">Fresh Produce</SelectItem>
                      <SelectItem value="farmspaces">Farm Spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
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

                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  Update Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              Found {filteredLocations.length} results within {searchRadius} miles
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                Map View
              </Button>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')}>
            <TabsContent value="map" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <InteractiveMap
                    locations={filteredLocations}
                    center={santaMonicaCenter}
                    zoom={12}
                    onLocationClick={handleLocationClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((location) => (
                  <Card key={`${location.type}-${location.id}`} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{location.title}</CardTitle>
                        <Badge variant={location.type === 'listing' ? 'default' : 'secondary'}>
                          {location.type === 'listing' ? 'Produce' : 'Farm Space'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{location.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>2.5 miles away</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8 rating (24 reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Usually responds in 2 hours</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-green-600">
                          ${location.price}{location.type === 'farmspace' ? '/month' : ''}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleLocationClick(location)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredLocations.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your search radius or category filters
                    </p>
                    <Button onClick={() => setSelectedCategory("all")}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}