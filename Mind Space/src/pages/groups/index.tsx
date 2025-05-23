import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Group } from '@/types';
import Link from 'next/link';

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchGroups();
    }
  }, [session]);
  
  if (status === 'loading' || (loading && status === 'authenticated')) {
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
    <Layout title="Support Groups - Mind Haven">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Support Groups</h1>
          <Link href="/groups/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Create New Group
          </Link>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-4">There are no support groups yet.</p>
            <p>Support groups provide a safe space for people with similar experiences to connect and share.</p>
            <p>Start by creating the first group!</p>
          </div>
        ) : (
          <div className="row">
            {groups.map(group => (
              <div key={group.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          background: 'var(--primary-gradient)' 
                        }}
                      >
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="card-title mb-0">{group.name}</h5>
                        <p className="text-muted small mb-0">{group.member_count} members</p>
                      </div>
                    </div>
                    <p className="card-text">{group.description}</p>
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link href={`/groups/${group.id}`} className="btn btn-outline-primary w-100">
                      Join Group
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}