import { Star } from 'lucide-react';

interface Author {
  name: string;
  image: string;
  role: string;
}

interface TestimonialCardProps {
  rating: number;
  comment: string;
  author: Author;
}

export default function TestimonialCard({ rating, comment, author }: TestimonialCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <div className="flex space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      <blockquote className="text-slate-700 mb-4">
        "{comment}"
      </blockquote>
      <footer className="flex items-center">
        <img src={author.image} alt={author.name} className="w-8 h-8 rounded-full" loading="lazy" />
        <div className="ml-3">
          <cite className="font-medium text-slate-900 not-italic">{author.name}</cite>
          <div className="text-sm text-slate-500">{author.role}</div>
        </div>
      </footer>
    </div>
  );
}
