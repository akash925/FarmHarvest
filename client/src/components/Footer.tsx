import { Link } from 'wouter';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pt-12 pb-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-primary-500 text-2xl">🌱</span>
              <span className="ml-2 text-xl font-display font-bold text-slate-800">FarmDirect</span>
            </div>
            <p className="text-slate-600 mb-4">Connecting local growers with food lovers for fresher, healthier communities.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Links 1 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/listings" className="text-slate-600 hover:text-slate-900">Browse Listings</Link></li>
              <li><Link href="/listings/new" className="text-slate-600 hover:text-slate-900">Sell Your Produce</Link></li>
              <li><Link href="/farm-spaces" className="text-slate-600 hover:text-slate-900">Farm Spaces</Link></li>
              <li><Link href="/map" className="text-slate-600 hover:text-slate-900">Interactive Map</Link></li>
            </ul>
          </div>
          
          {/* Links 2 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-slate-600 hover:text-slate-900">About Us</Link></li>
              <li><Link href="/blog" className="text-slate-600 hover:text-slate-900">Blog</Link></li>
              <li><Link href="/contact" className="text-slate-600 hover:text-slate-900">Contact</Link></li>
            </ul>
          </div>
          
          {/* Links 3 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-slate-600 hover:text-slate-900">Help Center</Link></li>
              <li><Link href="/safety" className="text-slate-600 hover:text-slate-900">Safety</Link></li>
              <li><Link href="/terms" className="text-slate-600 hover:text-slate-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-slate-600 hover:text-slate-900">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">&copy; {new Date().getFullYear()} FarmDirect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
