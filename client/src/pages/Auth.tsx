import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook, Mail, RefreshCw, User } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';

// Form validation schemas
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  zip: z.string().min(5, { message: "Please enter a valid zip code" }),
  isFarmer: z.boolean().default(false),
  about: z.string().optional(),
  productsGrown: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const signinSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Please enter your password" })
});

type SignupFormValues = z.infer<typeof signupSchema>;
type SigninFormValues = z.infer<typeof signinSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const { signIn, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Setup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      zip: "",
      isFarmer: false,
      about: "",
      productsGrown: "",
      termsAccepted: false
    }
  });
  
  const signinForm = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

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
  
  const onSignupSubmit = async (values: SignupFormValues) => {
    try {
      setIsLoading(true);
      
      // Remove confirmPassword and termsAccepted as they're not needed in the API
      const { confirmPassword, termsAccepted, ...userData } = values;
      
      // Set auth type for email/password signup
      const signupData = {
        ...userData,
        authType: 'email',
        authId: values.email, // Using email as the authId for email signup
      };
      
      const response = await apiRequest('POST', '/api/auth/signup', signupData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }
      
      // Auto login for demo purposes
      // Note: The API already sets the session, so we just need to get the user
      const sessionRes = await apiRequest('GET', '/api/auth/session');
      const sessionData = await sessionRes.json();
      if (sessionData.user) {
        // We don't need to call signIn since the session is already set
      }
      
      toast({
        title: 'Account Created!',
        description: 'You have successfully created an account and signed in.',
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'There was a problem creating your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSigninSubmit = async (values: SigninFormValues) => {
    try {
      setIsLoading(true);
      
      // Call the signin API directly
      const response = await apiRequest('POST', '/api/auth/signin', {
        email: values.email,
        password: values.password
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid email or password');
      }
      
      // Refresh the user session
      const sessionRes = await apiRequest('GET', '/api/auth/session');
      const sessionData = await sessionRes.json();
      
      toast({
        title: 'Welcome Back!',
        description: 'You have successfully signed in.',
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Signin failed:', error);
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
              <TabsContent value="signin" className="space-y-4 mt-0">
                <Form {...signinForm}>
                  <form onSubmit={signinForm.handleSubmit(onSigninSubmit)} className="space-y-4">
                    <FormField
                      control={signinForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signinForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FcGoogle className="h-5 w-5 mr-2" />
                    )}
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                    onClick={() => handleOAuthSignIn('facebook')}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Facebook className="h-5 w-5 mr-2" />
                    )}
                    Facebook
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <Button
                    variant="link"
                    className="text-sm text-slate-600"
                    onClick={() => setTab('signup')}
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={signupForm.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="90210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="isFarmer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I am a farmer/producer</FormLabel>
                            <FormDescription>
                              Check this if you want to sell products on FarmDirect
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {signupForm.watch("isFarmer") && (
                      <>
                        <FormField
                          control={signupForm.control}
                          name="about"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>About Your Farm</FormLabel>
                              <FormControl>
                                <Input placeholder="Tell us about your farm or garden..." {...field} />
                              </FormControl>
                              <FormDescription>
                                Share information about your growing practices, farm history, etc.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="productsGrown"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Products You Grow</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. tomatoes, herbs, eggs..." {...field} />
                              </FormControl>
                              <FormDescription>
                                List the main products you plan to sell
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    <FormField
                      control={signupForm.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the <a href="#" className="text-primary hover:underline">terms and conditions</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500">Or sign up with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <FcGoogle className="h-5 w-5 mr-2" />
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                    onClick={() => handleOAuthSignIn('facebook')}
                  >
                    <Facebook className="h-5 w-5 mr-2" />
                    Facebook
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <Button
                    variant="link"
                    className="text-sm text-slate-600"
                    onClick={() => setTab('signin')}
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
