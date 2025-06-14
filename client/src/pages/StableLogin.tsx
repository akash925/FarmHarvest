import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';

export default function StableLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('john@farm.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage(`Login successful! Welcome, ${data.user.name}`);
        
        // Verify session immediately
        setTimeout(async () => {
          const sessionCheck = await fetch('/api/auth/session', {
            credentials: 'include'
          });
          
          if (sessionCheck.ok) {
            const sessionData = await sessionCheck.json();
            setMessage(`Session verified! User: ${sessionData.user.name}`);
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            setMessage('Login succeeded but session verification failed');
          }
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Login failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      setMessage(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: email.split('@')[0], // Use email prefix as name
          email, 
          password,
          zip: '90210' 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage(`Signup successful! Welcome, ${data.user.name}`);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Signup failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      setMessage(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage(`Current session: ${data.user.name} (${data.user.email})`);
      } else {
        setMessage('No active session');
        setUser(null);
      }
    } catch (error: any) {
      setMessage(`Session check failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Stable Login - FarmDirect</title>
      </Helmet>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>FarmDirect Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit"
                onClick={handleLogin} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button 
                type="button"
                onClick={handleSignup} 
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
            
            <Button 
              type="button"
              onClick={checkSession} 
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              Check Session
            </Button>
          </form>
          
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {user && (
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-semibold text-green-800">Current User:</h3>
              <p className="text-green-700">{user.name} ({user.email})</p>
              <p className="text-green-600 text-sm">ZIP: {user.zip}</p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Test Accounts:</strong></p>
            <p>john@farm.com / password</p>
            <p>akash@agarwalhome.com / password</p>
            <p>akash.agarwal@conmitto.io / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}