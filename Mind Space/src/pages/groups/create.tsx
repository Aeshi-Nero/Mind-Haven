import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';

export default function CreateGroup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create group');
      }
      
      const data = await response.json();
      router.push(`/groups/${data.id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
    <Layout title="Create Group - Mind Haven">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="text-center mb-4">Create a Support Group</h1>
                
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Group Name</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Anxiety Support, Depression Recovery"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this group is about and who it's for..."
                      disabled={isSubmitting}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => router.push('/groups')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating Group...' : 'Create Group'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}