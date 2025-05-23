import Layout from '@/components/layout/Layout';
import SignupForm from '@/components/auth/SignupForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Signup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (session) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <Layout hideHeader hideFooter fullHeight>
      <div className="auth-container">
        <div className="auth-banner">
          <h1>Welcome to<br />MIND HAVEN</h1>
          <div className="py-4">
            <img 
              src="/images/brain-logo.svg" 
              alt="Brain logo" 
              className="brain-image"
              width={200}
              height={200}
            />
          </div>
          <p>Join our community of support and understanding</p>
        </div>
        
        <div className="auth-form">
          <SignupForm />
        </div>
      </div>
    </Layout>
  );
}