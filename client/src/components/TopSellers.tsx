import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import SellerCard from './SellerCard';

export default function TopSellers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/sellers/top'],
  });

  return (
    <section className="bg-slate-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4">Meet Our Top Sellers</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">These trusted local growers consistently provide high-quality, fresh produce to their communities.</p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full" aria-label="Loading"></div>
            <p className="mt-2 text-slate-600">Loading top sellers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load sellers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.sellers?.length > 0 ? (
              data.sellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-600">No sellers found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
