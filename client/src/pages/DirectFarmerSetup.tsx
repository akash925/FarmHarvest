import { useEffect } from 'react';
import { useLocation } from 'wouter';
import SellerProfileSetup from './SellerProfileSetup';

export default function DirectFarmerSetup() {
  const [, navigate] = useLocation();
  
  // We'll use a direct approach: use Akash's account info from the database
  useEffect(() => {
    // Set a direct URL that takes us to the seller profile setup
    const loadAkashAccount = async () => {
      try {
        const response = await fetch('/api/auth/direct-login/2', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          // Successfully set the session to Akash's account
          window.location.href = '/seller-profile-setup';
        } else {
          console.error('Failed to load Akash account');
        }
      } catch (error) {
        console.error('Error loading account:', error);
      }
    };
    
    loadAkashAccount();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Your Farmer Account...</h1>
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-slate-600">Setting up your enhanced farmer profile...</p>
      </div>
    </div>
  );
}