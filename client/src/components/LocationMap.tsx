import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Filter } from "lucide-react";

interface MapLocation {
  id: number;
  title: string;
  category: string;
  price: number;
  location: string;
  distance: string;
  lat: number;
  lng: number;
  type: 'listing' | 'farmspace';
}

interface LocationMapProps {
  locations: MapLocation[];
  userZip?: string;
  onLocationSelect?: (location: MapLocation) => void;
}

export default function LocationMap({ locations, userZip, onLocationSelect }: LocationMapProps) {
  const [searchRadius, setSearchRadius] = useState("10");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredLocations, setFilteredLocations] = useState(locations);

  useEffect(() => {
    let filtered = locations;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(loc => loc.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    setFilteredLocations(filtered);
  }, [locations, selectedCategory, searchRadius]);

  const categories = ["all", ...Array.from(new Set(locations.map(loc => loc.category)))];

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Local Marketplace Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="radius" className="text-sm font-medium">
                Search Radius:
              </label>
              <Input
                id="radius"
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                className="w-20"
                min="1"
                max="100"
              />
              <span className="text-sm text-muted-foreground">miles</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {userZip && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing results near {userZip}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Interactive Map Coming Soon
              </h3>
              <p className="text-gray-500 max-w-sm">
                We're working on integrating mapping services to show exact locations of farms and produce near you.
              </p>
            </div>
            
            {/* Simulated location pins */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        </CardContent>
      </Card>

      {/* Location Results */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">
          {filteredLocations.length} locations found within {searchRadius} miles
        </h3>
        
        {filteredLocations.map((location) => (
          <Card key={location.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onLocationSelect?.(location)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{location.title}</h4>
                    <Badge variant={location.type === 'listing' ? 'default' : 'secondary'}>
                      {location.type === 'listing' ? 'For Sale' : 'For Lease'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location.location}
                    </span>
                    <span>{location.distance}</span>
                    <Badge variant="outline">{location.category}</Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${location.price}
                    {location.type === 'farmspace' && <span className="text-sm font-normal">/month</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredLocations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try expanding your search radius or selecting different categories.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}