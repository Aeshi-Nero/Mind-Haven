import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <header className="navbar">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          {router.pathname !== '/' && (
            <button 
              onClick={handleGoBack} 
              className="btn btn-sm btn-outline-secondary me-3"
              aria-label="Go back"
            >
              <i className="bi bi-arrow-left"></i> Back
            </button>
          )}
          <Link href="/" className="navbar-brand">
            MIND HAVEN
          </Link>
        </div>
        
        {session && (
          <div className="d-none d-md-flex">
            <div className="position-relative me-3">
              <input 
                type="text" 
                className="form-control rounded-pill"
                placeholder="Search..."
                style={{ width: '250px' }}
              />
            </div>
          </div>
        )}
        
        <div className="d-flex align-items-center">
          {session ? (
            <>
              <Link href="/messages" className="nav-item d-none d-md-block">
                <i className="bi bi-chat-dots fs-5"></i>
              </Link>
              
              <Link href="/notifications" className="nav-item d-none d-md-block">
                <i className="bi bi-bell fs-5"></i>
              </Link>
              
              <div className="nav-item dropdown">
                <div 
                  className="d-flex align-items-center"
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=${session.user.name || session.user.username}&background=ff5e9b&color=fff`} 
                    alt="Profile" 
                    className="avatar"
                  />
                </div>
                
                {showMenu && (
                  <div className="dropdown-menu show position-absolute end-0" style={{ top: '50px' }}>
                    <Link href="/profile" className="dropdown-item">
                      <i className="bi bi-person me-2"></i> Profile
                    </Link>
                    <Link href="/settings" className="dropdown-item">
                      <i className="bi bi-gear me-2"></i> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline-primary me-2">
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}