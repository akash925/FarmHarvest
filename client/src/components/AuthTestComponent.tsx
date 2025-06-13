import { useAuth } from "@/lib/simpleAuth";

export default function AuthTestComponent() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold">Auth Debug:</h3>
      <p>isInitializing: {String(isInitializing)}</p>
      <p>isAuthenticated: {String(isAuthenticated)}</p>
      <p>user: {user ? `${user.name} (${user.email})` : 'null'}</p>
    </div>
  );
}