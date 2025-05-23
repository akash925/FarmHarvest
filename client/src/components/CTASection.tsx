import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function CTASection() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <section className="bg-primary-50 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-4">Ready to find fresh produce near you?</h2>
            <p className="text-lg text-slate-700 mb-6">Join our community of local growers and food enthusiasts. Whether you want to buy or sell, FarmDirect connects you with your neighbors.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/auth" className="inline-flex justify-center items-center px-6 py-3 bg-primary-400 hover:bg-primary-500 text-white font-medium rounded-lg shadow-sm transition duration-150 ease-in-out">
                Sign Up Now
              </Link>
              <Link href="/listings" className="inline-flex justify-center items-center px-6 py-3 border border-primary-400 text-primary-500 hover:bg-primary-50 font-medium rounded-lg transition duration-150 ease-in-out">
                Browse Listings
              </Link>
            </div>
            
            {isAuthenticated && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">For Farmers & Growers</h3>
                <p className="text-green-700 text-sm mb-3">Create a richer profile with photos, farm spaces, and more!</p>
                <Link href="/seller-profile-setup" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition duration-150 ease-in-out">
                  Setup Enhanced Profile
                </Link>
              </div>
            )}
          </div>
          <div className="md:w-2/5">
            {/* A hand holding fresh vegetables from a garden */}
            <img 
              src="https://images.unsplash.com/photo-1607305387299-a3d9611cd469?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400" 
              alt="Fresh garden vegetables" 
              className="w-full h-auto rounded-xl shadow-lg" 
              loading="lazy" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
