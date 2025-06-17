import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/cleanAuth";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { login, isLoading, isAuthenticated } = useAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "john@farm.com",
      password: "password123"
    }
  });

  // Redirect if already authenticated or after successful login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User is authenticated, redirecting...');
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('Starting login process...');
      await login(data.email, data.password);
      console.log('Login API call completed');
      // Navigation will be handled by the useEffect when auth state updates
    } catch (error) {
      console.error("Login failed:", error);
      // Show error in form
      form.setError('root', { 
        type: 'manual', 
        message: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>Sign In - FarmDirect</title>
        <meta name="description" content="Sign in to your FarmDirect account to connect with local farmers and access fresh produce." />
      </Helmet>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your FarmDirect account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter your email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter your password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {form.formState.errors.root.message || "Sign in failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/signup")}
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Demo credentials are pre-filled for testing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}