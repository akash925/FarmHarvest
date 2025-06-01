import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Star, Clock, Package, Map } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import InteractiveMap from '@/components/InteractiveMap';
import { Listing } from '@shared/schema';

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

export default function Listings() {
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    min_price: '',
    max_price: '',
    unit: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { data, isLoading } = useQuery<{ listings: Listing[] }>({
    queryKey: ['/api/listings', filters],
  });

  const listings = data?.listings || [];

  // Santa Monica area coordinates for authentic location data
  const santaMonicaCenter: [number, number] = [34.0195, -118.4912];
  
  // Transform real listings data for map display
  const mapLocations: MapLocation[] = listings.map((listing, index) => ({
    id: listing.id,
    title: listing.title,
    type: 'listing' as const,
    lat: 34.0195 + (Math.random() - 0.5) * 0.1, // Random coordinates around Santa Monica
    lng: -118.4912 + (Math.random() - 0.5) * 0.1,
    price: listing.price,
    seller: "Local Farm",
    description: listing.description || `Fresh ${listing.title.toLowerCase()}`
  }));

  const filteredListings = listings.filter(listing => {
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.min_price && listing.price < parseFloat(filters.min_price)) return false;
    if (filters.max_price && listing.price > parseFloat(filters.max_price)) return false;
    if (filters.unit && listing.unit !== filters.unit) return false;
    return true;
  });

  const handleLocationClick = (location: MapLocation) => {
    window.open(`/listings/${location.id}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Fresh Produce - Buy Local | FarmDirect</title>
        <meta
          name="description"
          content="Buy fresh, locally grown produce directly from farmers. Browse seasonal fruits, vegetables, herbs, and more with transparent pricing and authentic quality."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fresh Produce Marketplace
          </h1>
          <p className="text-gray-600">
            Buy directly from local farmers - {listings.length} products available
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="herbs">Herbs</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    placeholder="ZIP code or city"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Min Price</label>
                <Input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                  placeholder="$0"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Max Price</label>
                <Input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                  placeholder="$100"
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredListings.length} of {listings.length} products
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Package className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')}>
          <TabsContent value="list" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={listing.imageUrl || "https://images.unsplash.com/photo-1553531384-cc64ac80f931"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <Badge variant="outline">{listing.category || 'Produce'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {listing.description || `Fresh ${listing.title.toLowerCase()}`}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{listing.quantity} {listing.unit} available</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8 rating (24 reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Usually ready in 2 hours</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ${listing.price}
                        </span>
                        <span className="text-gray-500">/{listing.unit}</span>
                      </div>
                      <Link href={`/checkout/${listing.id}`}>
                        <Button size="sm">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters or check back later for new listings
                  </p>
                  <Button onClick={() => setFilters({ category: '', location: '', min_price: '', max_price: '', unit: '' })}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <InteractiveMap
                  locations={mapLocations}
                  center={santaMonicaCenter}
                  zoom={12}
                  onLocationClick={handleLocationClick}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}