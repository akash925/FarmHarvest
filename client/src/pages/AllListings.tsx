import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ListingCard from '@/components/ListingCard';
import SearchForm from '@/components/SearchForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AllListings() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState(new URLSearchParams(location.split('?')[1] || ''));
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [zip, setZip] = useState(searchParams.get('zip') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Update query parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('query', searchQuery);
    if (category) params.append('category', category);
    if (zip) params.append('zip', zip);
    
    setSearchParams(params);
  }, [searchQuery, category, zip]);
  
  // Fetch listings based on filters
  const { data, isLoading, error } = useQuery<{listings: any[]}>({
    queryKey: ['GET', `/api/listings?${searchParams.toString()}`],
  });

  // Handle search from the search form
  const handleSearch = (location: string, selectedCategory: string) => {
    setZip(location);
    setCategory(selectedCategory === 'All Categories' ? '' : selectedCategory);
  };

  return (
    <>
      <Helmet>
        <title>Browse Listings | FarmDirect</title>
        <meta
          name="description"
          content="Browse fresh local produce from farmers and gardeners in your area. Filter by category or location to find exactly what you need."
        />
      </Helmet>
      
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">Browse Listings</h1>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              {/* Filter button for mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filter Listings</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <SearchForm 
                      onSearch={handleSearch} 
                      initialZip={zip} 
                      initialCategory={category}
                      className="mb-6" 
                    />
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mobileSearchQuery">Search</Label>
                        <div className="relative mt-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="mobileSearchQuery"
                            placeholder="Search listings..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* View toggle buttons */}
              <div className="flex items-center rounded-md border border-input">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-none rounded-l-md ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-none rounded-r-md ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:grid md:grid-cols-12 md:gap-6">
            {/* Filters (desktop) */}
            <div className="hidden md:block md:col-span-3 lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Location</h3>
                  <Input
                    placeholder="ZIP Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="mb-4"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Category</h3>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="eggs">Eggs</SelectItem>
                      <SelectItem value="herbs">Herbs</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search listings..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Listings */}
            <div className="mt-6 md:mt-0 md:col-span-9 lg:col-span-10">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full" aria-label="Loading"></div>
                  <p className="mt-2 text-slate-600">Loading listings...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Failed to load listings</p>
                </div>
              ) : (
                <>
                  {data?.listings && data.listings.length > 0 ? (
                    <div className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }>
                      {data.listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No listings found</h3>
                      <p className="text-slate-600 mb-6">
                        There are no produce listings matching your criteria yet. You can either:
                      </p>
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                        <Button 
                          onClick={() => {
                            setSearchQuery('');
                            setCategory('');
                            setZip('');
                          }}
                          variant="outline"
                        >
                          Clear Filters
                        </Button>
                        <Button onClick={() => window.location.href = '/listings/new'}>
                          List Your Produce
                        </Button>
                      </div>
                      <p className="mt-6 text-sm text-slate-500">
                        Be the first to share your locally grown produce with your community!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
