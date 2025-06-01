import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Search, Menu, X } from 'lucide-react';


export default function Navbar() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasSellerProfile, setHasSellerProfile] = useState(false);
  
  // Direct authentication check without relying on broken context
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          
          // Check seller profile
          if (data.user) {
            try {
              const profileRes = await fetch(`/api/seller-profiles/${data.user.id}`);
              if (profileRes.ok) {
                const profileData = await profileRes.json();
                setHasSellerProfile(!!profileData?.profile);
              }
            } catch (e) {
              setHasSellerProfile(false);
            }
          }
        } else {
          setCurrentUser(null);
          setHasSellerProfile(false);
        }
      } catch (error) {
        setCurrentUser(null);
        setHasSellerProfile(false);
      }
    };
    
    checkAuth();
    // Re-check every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const isAuthenticated = !!currentUser;
  

  

  
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      setCurrentUser(null);
      setHasSellerProfile(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-primary-500 text-2xl">🌱</span>
              <span className="ml-2 text-xl font-display font-bold text-slate-800">FarmDirect</span>
            </Link>
          </div>
          

          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/listings" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
              Buy
            </Link>
            <Link href="/farm-spaces" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
              Lease
            </Link>
            <Link href="/marketplace-map" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
              Map
            </Link>
            <Link href="/sell" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
              Sell
            </Link>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.image || ''} alt={currentUser?.name || 'User'} />
                      <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${currentUser?.id}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/seller-profile/${currentUser?.id}`}>Farmer Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/seller-profile-setup">Setup Farm Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth" className="text-primary-600 hover:text-primary-800 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/auth" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/listings" 
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buy
            </Link>
            <Link 
              href="/farm-spaces" 
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lease
            </Link>
            <Link 
              href="/listings/new" 
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  href={`/users/${currentUser?.id}`} 
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  href={`/seller-profile/${currentUser?.id}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Farmer Profile
                </Link>
                <Link 
                  href="/seller-profile-setup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Setup Farm Profile
                </Link>
                <Link 
                  href="/profile/edit" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link 
                  href="/orders" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-400 text-white hover:bg-primary-500 mt-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
