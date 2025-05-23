import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      
      if (result?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <div className="text-end mb-4">
        <img 
          src="https://ui-avatars.com/api/?name=User&background=eee&color=999&size=32" 
          alt="User" 
          className="rounded-circle"
        />
      </div>
      
      <p className="greeting">Hi, Havener!</p>
      <h2>Login</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <div className="text-end mt-2">
            <Link href="/forgot-password" className="link">
              Forgot Password?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-block mb-4"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <div className="text-center">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}