import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Group } from '@/types';
import GroupChat from '@/components/groups/GroupChat';

export default function GroupDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id || !session) return;
      
      try {
        const response = await fetch(`/api/groups/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
          setIsMember(data.isMember);
        } else {
          router.push('/groups');
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroup();
  }, [id, session, router]);
  
  const handleJoinGroup = async () => {
    if (!id || !session) return;
    
    try {
      const response = await fetch(`/api/groups/${id}/join`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsMember(true);
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!id || !session || !group) return;
    
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/groups/${id}/delete`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/groups');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete group');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('An error occurred while deleting the group');
      setIsDeleting(false);
    }
  };
  
  const isCreator = group && session && parseInt(session.user.id) === group.created_by;
  
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
  
  if (!group) {
    return (
      <Layout title="Group Not Found">
        <div className="container py-5 text-center">
          <h2>Group not found</h2>
          <p>The group you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => router.push('/groups')}
          >
            Back to Groups
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${group.name} - Mind Haven`}>
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="text-center mb-4">
                  <div 
                    className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: 'var(--primary-gradient)' 
                    }}
                  >
                    {group.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h2>{group.name}</h2>
                  <p className="text-muted">{group.member_count} members</p>
                </div>
                
                <p>{group.description}</p>
                
                <div className="d-grid gap-2">
                  {!isMember && (
                    <button 
                      className="btn btn-primary"
                      onClick={handleJoinGroup}
                    >
                      Join Group
                    </button>
                  )}
                  
                  {isCreator && (
                    <button 
                      className="btn btn-danger"
                      onClick={handleDeleteGroup}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Group'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-8">
            {isMember ? (
              <GroupChat groupId={group.id} groupName={group.name} />
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <h3>Join this group to participate in discussions</h3>
                  <p className="text-muted mb-4">
                    Connect with others who understand what you're going through
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleJoinGroup}
                  >
                    Join Group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}