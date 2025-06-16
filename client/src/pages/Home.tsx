import { Helmet } from 'react-helmet-async';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>FarmDirect - Local Farm Produce Marketplace</title>
        <meta
          name="description"
          content="Discover and purchase homegrown produce from local farmers and gardeners near you. Fresh from local farms direct to your table."
        />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-green-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              🌱 FarmDirect
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Fresh from Local Farms Direct to Your Table
            </p>
            <p className="text-lg opacity-90">
              Discover and purchase homegrown produce from local farmers and gardeners near you.
            </p>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Welcome to FarmDirect! 🚜</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your local agricultural marketplace is ready! Connect with farmers, 
              browse fresh produce, and support your local community.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600 mb-4">Find fresh produce from local farmers</p>
              <a href="/listings" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View Listings
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600 mb-4">Join our farming community</p>
              <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Sign Up
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold mb-2">Start Selling</h3>
              <p className="text-gray-600 mb-4">List your farm products</p>
              <a href="/sell" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Start Selling
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">Platform Features</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4">
                <div className="text-3xl mb-2">🌾</div>
                <h4 className="font-semibold">Fresh Produce</h4>
                <p className="text-sm text-gray-600">Direct from local farms</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">📍</div>
                <h4 className="font-semibold">Location-Based</h4>
                <p className="text-sm text-gray-600">Find farms near you</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="font-semibold">Direct Messaging</h4>
                <p className="text-sm text-gray-600">Chat with farmers</p>
              </div>
              <div className="p-4">
                <div className="text-3xl mb-2">🏡</div>
                <h4 className="font-semibold">Farm Spaces</h4>
                <p className="text-sm text-gray-600">Rent growing space</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
