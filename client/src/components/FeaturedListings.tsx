import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import ListingCard from './ListingCard';
import { ArrowRight } from 'lucide-react';

export default function FeaturedListings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/listings/featured'],
  });

  return (
    <section className="bg-slate-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900">Featured Listings</h2>
            <p className="text-slate-600 mt-2">Fresh picks from local farmers near you</p>
          </div>
          <Link href="/listings" className="text-primary-500 hover:text-primary-600 font-medium flex items-center">
            View all
            <ArrowRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
        
        {/* Listings Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.listings?.length > 0 ? (
              data.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-600">No listings found</p>
                <Link href="/listings/new" className="mt-4 inline-block btn-primary">
                  Add your first listing
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
