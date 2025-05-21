import TestimonialCard from './TestimonialCard';

export default function Testimonials() {
  const testimonials = [
    {
      rating: 5,
      comment: "The produce from Happy Hens Homestead is amazing! Their eggs have beautiful orange yolks and the best flavor. I love supporting local farmers and this platform makes it so easy.",
      author: {
        name: "Rachel M.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40",
        role: "Buyer since 2022"
      }
    },
    {
      rating: 5,
      comment: "I've been selling my small batch honey and seasonal berries on this platform for 6 months now, and I'm thrilled with the connections I've made. The payment process is seamless and I love meeting local food enthusiasts.",
      author: {
        name: "James B.",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40",
        role: "Seller since 2021"
      }
    },
    {
      rating: 4,
      comment: "Cherry Hill Farm's heirloom tomatoes are out of this world. I tried varieties I'd never find at a grocery store, and picking them up directly from Sarah's farm was a fantastic experience. Can't wait to try more!",
      author: {
        name: "David R.",
        image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40",
        role: "Buyer since 2023"
      }
    }
  ];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4">What Our Community Says</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Real experiences from buyers and sellers in our marketplace.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              rating={testimonial.rating}
              comment={testimonial.comment}
              author={testimonial.author}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
