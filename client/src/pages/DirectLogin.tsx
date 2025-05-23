import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DirectLogin() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const login = async () => {
      try {
        // Direct login for Akash's account (id: 2)
        const response = await fetch('/api/auth/direct-login/2', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Direct login successful:', data);
          setStatus('success');
          
          // Give some time to display success message
          setTimeout(() => {
            // Redirect to the seller profile setup page
            window.location.href = '/seller-profile-setup';
          }, 1500);
        } else {
          const error = await response.json();
          console.error('Direct login failed:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Failed to log in');
        }
      } catch (error) {
        console.error('Login error:', error);
        setStatus('error');
        setErrorMessage('Network error while trying to log in');
      }
    };
    
    login();
  }, [navigate]);
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'checking' && 'Logging you in...'}
            {status === 'success' && 'Login Successful!'}
            {status === 'error' && 'Login Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'checking' && 'Please wait while we log you in as Akash'}
            {status === 'success' && 'Redirecting you to your profile setup page'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'checking' && (
            <div className="flex justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-600">Redirecting to your enhanced farmer profile setup...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                There was an error logging you in. Please try again or use the regular login page.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Go to Login
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}