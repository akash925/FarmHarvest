import { useAuth } from './useAuth';

export function useFarmProfile() {
  const { sellerProfile, isAuthenticated, user } = useAuth();
  return { farmProfile: sellerProfile, isAuthenticated, user };
}

export default useFarmProfile; 