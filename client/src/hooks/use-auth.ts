import { useContext, useEffect } from 'react';
import { AuthContext } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add an effect to verify auth state on component mount
  useEffect(() => {
    // Only check if we think we're not authenticated but don't check during initialization
    if (!context.isAuthenticated && !context.isInitializing) {
      const verifyAuthState = async () => {
        try {
          const response = await apiRequest('GET', '/api/auth/session');
          if (response.ok) {
            const data = await response.json();
            // If server says we're logged in but UI doesn't show it, reload the page
            if (data.user && !context.user) {
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Failed to verify auth state:', error);
        }
      };
      
      verifyAuthState();
    }
  }, [context.isAuthenticated, context.isInitializing, context.user]);
  
  return context;
}
