import { useEffect, useState } from 'react';
import { Group } from '@/types';
import Link from 'next/link';

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
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
    
    fetchGroups();
  }, []);
  
  if (loading) {
    return <div className="text-center py-3">Loading groups...</div>;
  }
  
  if (groups.length === 0) {
    return (
      <div className="text-center py-3">
        <p>No groups found.</p>
        <Link href="/groups/create" className="btn btn-sm btn-primary">
          Create a Group
        </Link>
      </div>
    );
  }
  
  return (
    <ul className="groups-list">
      {groups.map(group => (
        <li key={group.id}>
          <Link href={`/groups/${group.id}`} className="group-item text-decoration-none">
            <div className="group-icon">
              {group.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="group-info">
              <div className="group-name">{group.name}</div>
              <div className="group-members">{group.member_count} members</div>
            </div>
          </Link>
        </li>
      ))}
      <li className="text-center pt-2">
        <Link href="/groups/create" className="btn btn-sm btn-outline-primary">
          <i className="bi bi-plus-circle me-1"></i> Create New Group
        </Link>
      </li>
    </ul>
  );
}