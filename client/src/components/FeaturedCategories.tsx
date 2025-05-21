import { Link } from 'wouter';

interface CategoryCardProps {
  title: string;
  imageUrl: string;
}

function CategoryCard({ title, imageUrl }: CategoryCardProps) {
  return (
    <Link href={`/listings?category=${title}`} className="group">
      <div className="aspect-square rounded-xl overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <span className="text-white font-medium text-lg md:text-xl">{title}</span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedCategories() {
  const categories = [
    {
      title: 'Fruits',
      imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500'
    },
    {
      title: 'Vegetables',
      imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500'
    },
    {
      title: 'Eggs',
      imageUrl: 'https://pixabay.com/get/g3c2f13735f24207279562a6b7e1ea69b2d2f3ccb1599ca94ee4383066fa57fce0902fccbb529b5ced9b82ebac0ac71bef3f2fbc1b354a27e0ad56ce24bddb4e7_1280.jpg'
    },
    {
      title: 'Herbs',
      imageUrl: 'https://pixabay.com/get/gba1841daaa1810e0efdb94f932bbc724f29e44c26378fe5e5095fd0c7f599074d2a0bbfb8a1c791419ab86152d27aa739a1cc5d5fea8ef3981fa2ffd323652d7_1280.jpg'
    }
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 text-center mb-8">
          What are you looking for?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index} 
              title={category.title} 
              imageUrl={category.imageUrl} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
