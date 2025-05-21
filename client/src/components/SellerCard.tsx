import { Link } from 'wouter';
import { User } from '@shared/schema';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SellerCardProps {
  seller: User;
}

export default function SellerCard({ seller }: SellerCardProps) {
  // Get seller reviews
  const { data: reviewsData } = useQuery({
    queryKey: [`/api/reviews/seller/${seller.id}`],
  });

  const reviews = reviewsData?.reviews || [];
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  
  // Get product tags from productsGrown
  const productTags = seller.productsGrown
    ? seller.productsGrown.split(',').map(tag => tag.trim())
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex items-center">
          <img 
            src={seller.image || 'https://via.placeholder.com/80x80?text=User'} 
            alt={seller.name || 'Seller profile'} 
            className="w-16 h-16 rounded-full object-cover" 
            loading="lazy" 
          />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-slate-900">{seller.name}</h3>
            <div className="flex items-center mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-slate-500">{reviews.length} reviews</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-slate-600 text-sm">{seller.about || 'No description available.'}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {productTags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <Link href={`/users/${seller.id}`} className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center">
            View Profile
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
