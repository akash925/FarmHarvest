import { useContext, useEffect } from 'react';
import { AuthContext } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Simplified auth verification - just return context without additional effects
  
  return context;
}
