import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const { toast } = useToast();

  React.useEffect(() => {
    // Show error toast when component mounts
    toast({
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again.',
      variant: 'destructive',
    });

    // Log to console (in production, you'd log to Sentry or another service)
    console.error('ErrorBoundary caught an error:', error);
  }, [error, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. We've been notified and are working to fix it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Error details (for developers)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
          <div className="flex space-x-2">
            <Button onClick={resetErrorBoundary} variant="outline">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="default">
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: Error, errorInfo: any) => {
        // Log to console or external service like Sentry
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // In production, you'd send this to an error tracking service
        // Example: Sentry.captureException(error, { contexts: { errorInfo } });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundary;