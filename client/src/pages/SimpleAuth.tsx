import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from "@/lib/simpleAuth";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';

export default function SimpleAuth() {
  // Basic state management
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isFarmer, setIsFarmer] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [zip, setZip] = useState('');
  const [about, setAbout] = useState('');
  const [productsGrown, setProductsGrown] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }
  
  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!zip) newErrors.zip = 'ZIP code is required';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions';
    
    if (isFarmer) {
      if (!about) newErrors.about = 'Please tell us about your farm';
      if (!productsGrown) newErrors.productsGrown = 'Please list products you grow';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;
    
    try {
      setIsLoading(true);
      
      // Prepare user data for API
      const userData = {
        name,
        email,
        password,
        zip,
        isFarmer,
        about: isFarmer ? about : undefined,
        productsGrown: isFarmer ? productsGrown : undefined,
        authType: 'email',
        authId: email,
      };
      
      // Send signup request
      const response = await apiRequest('POST', '/api/auth/signup', userData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }
      
      // Get the user data and automatically sign them in
      const userResponse = await response.json();
      
      // Force a refresh of the auth session
      await apiRequest('GET', '/api/auth/session');
      
      toast({
        title: 'Account Created!',
        description: 'You have successfully created an account and signed in.',
      });
      
      // Short delay before redirecting to ensure session is set
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'There was a problem creating your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignIn()) return;
    
    try {
      setIsLoading(true);
      
      // Send signin request
      const response = await apiRequest('POST', '/api/auth/signin', {
        email,
        password,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid email or password');
      }
      
      toast({
        title: 'Welcome Back!',
        description: 'You have successfully signed in.',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} | FarmDirect</title>
        <meta
          name="description"
          content="Sign in or create an account to buy and sell fresh local produce on FarmDirect."
        />
      </Helmet>

      <div className="flex items-center justify-center min-h-[calc(100vh-13rem)] bg-slate-50 py-12">
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
              {isSignUp ? 'Join FarmDirect' : 'Welcome Back'}
            </h1>
            <p className="text-slate-600">
              {isSignUp
                ? 'Create an account to start buying and selling local produce'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={!isSignUp ? 'default' : 'outline'} 
                  onClick={() => setIsSignUp(false)}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button 
                  variant={isSignUp ? 'default' : 'outline'} 
                  onClick={() => setIsSignUp(true)}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      placeholder="John Smith" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="your.email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input 
                      id="zip"
                      placeholder="90210" 
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                    {errors.zip && <p className="text-sm text-red-500 mt-1">{errors.zip}</p>}
                  </div>
                  
                  <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox 
                      id="isFarmer"
                      checked={isFarmer}
                      onCheckedChange={(checked) => setIsFarmer(checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="isFarmer">I am a farmer/producer</Label>
                      <p className="text-sm text-gray-500">
                        Check this if you want to sell products on FarmDirect
                      </p>
                    </div>
                  </div>
                  
                  {isFarmer && (
                    <>
                      <div>
                        <Label htmlFor="about">About Your Farm</Label>
                        <Textarea 
                          id="about"
                          placeholder="Tell us about your farm or garden..." 
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Share information about your growing practices, farm history, etc.
                        </p>
                        {errors.about && <p className="text-sm text-red-500 mt-1">{errors.about}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="productsGrown">Products You Grow</Label>
                        <Input 
                          id="productsGrown"
                          placeholder="e.g. tomatoes, herbs, eggs..." 
                          value={productsGrown}
                          onChange={(e) => setProductsGrown(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          List the main products you plan to sell
                        </p>
                        {errors.productsGrown && <p className="text-sm text-red-500 mt-1">{errors.productsGrown}</p>}
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-start space-x-3 space-y-0">
                    <Checkbox 
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="terms">
                        I accept the <a href="#" className="text-primary hover:underline">terms and conditions</a>
                      </Label>
                      {errors.terms && <p className="text-sm text-red-500 mt-1">{errors.terms}</p>}
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-sm text-slate-600"
                      onClick={() => setIsSignUp(false)}
                      type="button"
                    >
                      Already have an account? Sign in
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input 
                      id="signin-password"
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-sm text-slate-600"
                      onClick={() => setIsSignUp(true)}
                      type="button"
                    >
                      Don't have an account? Sign up
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}