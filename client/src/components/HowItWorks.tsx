export default function HowItWorks() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4">How FarmDirect Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Connect with local growers, purchase fresh produce, and arrange pickup - it's that simple.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-xl font-bold mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Discover Local Produce</h3>
            <p className="text-slate-600">Browse listings from local farmers and gardeners in your area. Filter by product type or distance.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-xl font-bold mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Purchase Directly</h3>
            <p className="text-slate-600">Pay securely through our platform. Your payment is held until you pick up your items.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-xl font-bold mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Arrange Pickup</h3>
            <p className="text-slate-600">Coordinate with the seller for pickup at their location. Some offer on-site "pick your own" options.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
