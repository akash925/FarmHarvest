import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/simpleAuth';

export default function AuthTest() {
  const [email, setEmail] = useState('john@farm.com');
  const [password, setPassword] = useState('password');
  const [result, setResult] = useState('');
  const { user, signIn, signOut, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      setResult('Logging in...');
      await signIn(email, password);
      setResult('Login successful!');
    } catch (error: any) {
      setResult(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      setResult('Logging out...');
      await signOut();
      setResult('Logout successful!');
    } catch (error: any) {
      setResult(`Logout failed: ${error.message}`);
    }
  };

  const checkSession = async () => {
    try {
      setResult('Checking session...');
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(`Session valid: ${JSON.stringify(data.user, null, 2)}`);
      } else {
        setResult('No valid session');
      }
    } catch (error: any) {
      setResult(`Session check failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email:</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label>Password:</label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleLogin} disabled={isLoading}>
              Login
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <Button onClick={checkSession} variant="secondary">
              Check Session
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Auth State:</h3>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.name : 'None'}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold">Result:</h3>
            <pre className="text-sm">{result}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}