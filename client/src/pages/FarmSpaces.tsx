import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Square, Droplets, Sun, Wrench, Home, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface FarmSpace {
  id: number;
  title: string;
  description: string;
  sizeSqft: number;
  pricePerMonth: number;
  soilType: string;
  lightConditions: string;
  waterAccess: boolean;
  greenhouseAccess: boolean;
  toolStorage: boolean;
  location: string;
  availableFrom: string;
  availableUntil?: string;
}

export default function FarmSpaces() {
  const [filters, setFilters] = useState({
    location: '',
    soil_type: '',
    light_conditions: '',
    min_size: '',
    max_price: '',
    water_access: '',
    greenhouse_access: '',
    tool_storage: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['/api/farm-spaces', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/farm-spaces?${params}`);
      if (!response.ok) throw new Error('Failed to fetch farm spaces');
      return response.json();
    }
  });

  const farmSpaces = data?.farmSpaces || [];

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}/month`;
  };

  const formatSoilType = (soilType: string | null) => {
    if (!soilType) return 'Unknown';
    return soilType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatLightConditions = (light: string | null) => {
    if (!light) return 'Unknown';
    return light.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
        <title>Farm Spaces for Rent | FarmDirect</title>
        <meta
          name="description"
          content="Find and rent farm spaces near you. Browse plots with different soil types, light conditions, and amenities for your growing needs."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Farm Spaces for Rent
          </h1>
          <p className="text-slate-600">
            Find the perfect growing space for your plants. Filter by location, soil type, light conditions, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Narrow down your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Location
                  </label>
                  <Input
                    placeholder="Enter ZIP code or city"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Soil Type */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Soil Type
                  </label>
                  <Select
                    value={filters.soil_type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, soil_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any soil type</SelectItem>
                      <SelectItem value="loamy">Loamy</SelectItem>
                      <SelectItem value="sandy_loam">Sandy Loam</SelectItem>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="potting_mix">Potting Mix</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Light Conditions */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Light Conditions
                  </label>
                  <Select
                    value={filters.light_conditions}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, light_conditions: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any light level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any light level</SelectItem>
                      <SelectItem value="full_sun">Full Sun</SelectItem>
                      <SelectItem value="partial_sun">Partial Sun</SelectItem>
                      <SelectItem value="partial_shade">Partial Shade</SelectItem>
                      <SelectItem value="full_shade">Full Shade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Minimum Size (sq ft)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    value={filters.min_size}
                    onChange={(e) => setFilters(prev => ({ ...prev, min_size: e.target.value }))}
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Max Price ($/month)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    value={filters.max_price}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                  />
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={filters.water_access === 'true'}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          water_access: e.target.checked ? 'true' : '' 
                        }))}
                      />
                      <span className="ml-2 text-sm">Water Access</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={filters.greenhouse_access === 'true'}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          greenhouse_access: e.target.checked ? 'true' : '' 
                        }))}
                      />
                      <span className="ml-2 text-sm">Greenhouse Access</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={filters.tool_storage === 'true'}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          tool_storage: e.target.checked ? 'true' : '' 
                        }))}
                      />
                      <span className="ml-2 text-sm">Tool Storage</span>
                    </label>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    location: '',
                    soil_type: '',
                    light_conditions: '',
                    min_size: '',
                    max_price: '',
                    water_access: '',
                    greenhouse_access: '',
                    tool_storage: ''
                  })}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Farm Spaces Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                {farmSpaces.length} space{farmSpaces.length !== 1 ? 's' : ''} available
              </p>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </div>

            {farmSpaces.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No farm spaces found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your filters or expanding your search area.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {farmSpaces.map((space: FarmSpace) => (
                  <Card key={space.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{space.title}</CardTitle>
                        <Badge variant="secondary" className="bg-primary-100 text-primary-800">
                          {formatPrice(space.pricePerMonth)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center text-slate-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {space.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4 line-clamp-2">
                        {space.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Square className="h-4 w-4 mr-2" />
                          {space.sizeSqft} sq ft
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Sun className="h-4 w-4 mr-2" />
                          {formatLightConditions(space.lightConditions)}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Available {formatDate(space.availableFrom)}
                        </div>
                        <div className="text-sm text-slate-600">
                          {formatSoilType(space.soilType)} soil
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {space.waterAccess && (
                          <Badge variant="outline" className="text-xs">
                            <Droplets className="h-3 w-3 mr-1" />
                            Water Access
                          </Badge>
                        )}
                        {space.greenhouseAccess && (
                          <Badge variant="outline" className="text-xs">
                            <Home className="h-3 w-3 mr-1" />
                            Greenhouse
                          </Badge>
                        )}
                        {space.toolStorage && (
                          <Badge variant="outline" className="text-xs">
                            <Wrench className="h-3 w-3 mr-1" />
                            Tool Storage
                          </Badge>
                        )}
                      </div>

                      <Button className="w-full">
                        Contact Owner
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}