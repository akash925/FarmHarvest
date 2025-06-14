import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search } from 'lucide-react';
import { useAuth } from '@/lib/simpleAuth';

export default function SearchWithLocation() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const userZip = user?.zip || '';

  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: [`/api/listings?query=${query}&category=${category}&userZip=${userZip}`],
    enabled: searchPerformed,
  });

  const handleSearch = () => {
    setSearchPerformed(true);
    refetch();
  };

  const listings = searchResults?.listings || [];
  const distantListings = searchResults?.distantListings || [];
  const locationMessage = searchResults?.message;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Farm Products
            {user?.zip && (
              <Badge variant="outline" className="ml-auto">
                <MapPin className="h-3 w-3 mr-1" />
                {user.zip}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="herbs">Herbs</SelectItem>
                <SelectItem value="eggs">Eggs</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchPerformed && (
        <div className="space-y-4">
          {locationMessage && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <p className="text-orange-800 font-medium">{locationMessage}</p>
              </CardContent>
            </Card>
          )}

          {listings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">
                  Nearby Products ({listings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing: any) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">${(listing.price / 100).toFixed(2)}/{listing.unit}</span>
                        {listing.distance !== null && (
                          <Badge variant="secondary">
                            {listing.distance.toFixed(1)} mi
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {distantListings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Products Further Away ({distantListings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {distantListings.map((listing: any) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">${(listing.price / 100).toFixed(2)}/{listing.unit}</span>
                        {listing.distance !== null && (
                          <Badge variant="outline">
                            {listing.distance.toFixed(1)} mi
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {searchPerformed && listings.length === 0 && distantListings.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No products found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}