import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';

export default function About() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <Layout title="Loading...">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!session) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <Layout title="About - Mind Haven">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h1 className="text-center mb-5">About Mind Haven</h1>
                
                <h3 className="mb-4">Creators</h3>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 py-3 fs-5">Marvi Dumayahon</li>
                  <li className="list-group-item px-0 py-3 fs-5">Dhen Mark Taberna</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}