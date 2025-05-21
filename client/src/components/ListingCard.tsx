import { Link } from 'wouter';
import { Listing } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${listing.userId}`],
  });

  const seller = userData?.user;
  
  // Format price display
  const formatPrice = (price: number, unit: string) => {
    const dollars = (price / 100).toFixed(2);
    return `$${dollars}/${unit === 'pound' ? 'lb' : 'item'}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300 ease-in-out">
      <div className="relative">
        <Link href={`/listings/${listing.id}`}>
          <img 
            src={listing.imageUrl || 'https://via.placeholder.com/500x300?text=No+Image'} 
            alt={listing.title} 
            className="w-full h-48 object-cover" 
            loading="lazy" 
          />
        </Link>
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-terracotta-400 text-white">
            {formatPrice(listing.price, listing.unit)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/listings/${listing.id}`}>
              <h3 className="text-lg font-semibold text-slate-900 mb-1 hover:text-primary-500">{listing.title}</h3>
            </Link>
            <p className="text-sm text-slate-600">{listing.category} • {seller?.name || 'Unknown Seller'}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center">
          {listing.pickAndPack && (
            <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium mr-2">Pick & Pack</div>
          )}
          <div className="text-slate-500 text-sm">{listing.quantity} {listing.unit === 'pound' ? 'lb' : 'items'} available</div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Link href={`/users/${listing.userId}`} className="flex items-center">
            <img 
              src={seller?.image || 'https://via.placeholder.com/40x40?text=User'} 
              alt={seller?.name || 'Seller profile'} 
              className="w-6 h-6 rounded-full" 
              loading="lazy" 
            />
            <span className="ml-2 text-sm text-slate-600">{seller ? seller.name?.split(' ')[0] : 'Unknown'}</span>
          </Link>
          {seller?.zip && (
            <span className="text-xs text-slate-500">{seller.zip}</span>
          )}
        </div>
      </div>
    </div>
  );
}
