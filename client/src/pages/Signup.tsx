import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  zip: z.string().min(5, "ZIP code must be at least 5 characters")
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, navigate] = useLocation();
  const { signUp, signUpError, isSigningUp, isAuthenticated } = useAuth();
  const [success, setSuccess] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      zip: ""
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: SignupForm) => {
    try {
      await signUp(data);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      // Error is handled by the hook and available in signUpError
      console.error("Signup failed:", error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">✓</div>
              <h2 className="text-xl font-semibold mb-2">Welcome to FarmDirect!</h2>
              <p className="text-gray-600">Your account has been created and you're now signed in. Redirecting...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>Sign Up - FarmDirect</title>
        <meta name="description" content="Create your FarmDirect account to start buying and selling fresh, local produce." />
      </Helmet>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Join FarmDirect to connect with local farmers and access fresh produce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                      <Input {...field} type="password" placeholder="Create a password (min 8 characters)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your ZIP code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {signUpError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {signUpError.message || "Sign up failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}