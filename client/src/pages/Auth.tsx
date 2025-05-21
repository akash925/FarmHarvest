import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook, Mail, RefreshCw } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const { signIn, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      await signIn(provider);
      toast({
        title: 'Success!',
        description: 'You have successfully signed in.',
      });
      navigate('/');
    } catch (error) {
      console.error(`Failed to sign in with ${provider}:`, error);
      toast({
        title: 'Sign In Failed',
        description: `There was a problem signing in with ${provider}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{tab === 'signin' ? 'Sign In' : 'Sign Up'} | FarmDirect</title>
        <meta
          name="description"
          content="Sign in or create an account to buy and sell fresh local produce on FarmDirect."
        />
      </Helmet>

      <div className="flex items-center justify-center min-h-[calc(100vh-13rem)] bg-slate-50 py-12">
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
              {tab === 'signin' ? 'Welcome Back' : 'Join FarmDirect'}
            </h1>
            <p className="text-slate-600">
              {tab === 'signin'
                ? 'Sign in to your account to continue'
                : 'Create an account to start buying and selling local produce'}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <Tabs value={tab} onValueChange={(value) => setTab(value as 'signin' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  className="w-full flex items-center justify-center"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => handleOAuthSignIn('google')}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FcGoogle className="h-5 w-5 mr-2" />
                  )}
                  {tab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </Button>

                <Button
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                  onClick={() => handleOAuthSignIn('facebook')}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Facebook className="h-5 w-5 mr-2" />
                  )}
                  {tab === 'signin' ? 'Sign in with Facebook' : 'Sign up with Facebook'}
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500">
                    {tab === 'signin' ? 'New to FarmDirect?' : 'Already have an account?'}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                variant="link"
                onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
              >
                {tab === 'signin'
                  ? 'Create a new account'
                  : 'Sign in with an existing account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
