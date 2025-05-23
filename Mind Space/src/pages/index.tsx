import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PostForm from '@/components/home/PostForm';
import PostList from '@/components/home/PostList';
import GroupList from '@/components/groups/GroupList';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
  
  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <Layout title="Mind Haven - Home">
      <div className="home-page-bg py-4">
        <div className="content-container">
          {/* Left Sidebar */}
          <div className="sidebar d-none d-lg-block">
            <h3>Navigation</h3>
            <Link href="/" className="sidebar-link">
              <i className="bi bi-house-door"></i> Home
            </Link>
            <Link href="/profile" className="sidebar-link">
              <i className="bi bi-person"></i> Profile
            </Link>
            <Link href="/groups" className="sidebar-link">
              <i className="bi bi-people"></i> Groups
            </Link>
            <Link href="/about" className="sidebar-link">
              <i className="bi bi-info-circle"></i> About
            </Link>
            <Link href="/settings" className="sidebar-link">
              <i className="bi bi-gear"></i> Settings
            </Link>
          </div>
          
          {/* Main Content */}
          <div>
            <PostForm onPostCreated={handlePostCreated} />
            <PostList refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Sidebar */}
          <div className="sidebar d-none d-lg-block">
            <h3>Support Groups</h3>
            <GroupList />
          </div>
        </div>
      </div>
    </Layout>
  );
}