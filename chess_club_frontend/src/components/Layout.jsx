import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import SiteLogo from '../components/SiteLogo';

function Layout({ user,avatar }) {

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div>
    <SiteLogo/>
      <nav style={{ 
        display: 'flex', 
        gap: '1rem', 
        padding: '1rem', 
        borderBottom: '1px solid #ccc' 
      }}>
        <Link to="/">Home</Link>
        <Link to="/standings">Standings</Link>

        
        {!user && <Link to="/register">Register</Link>}

        {user && user.role === 'admin' && <Link to="/admin">Admin</Link>}
        {user && <Link to={`/player/${user?.id}`}>My Dashboard</Link>}
        {user && <Link to="/challenge">Challenge</Link>}
        
        {!user && <Link to="/login">Login</Link>} 

        {user && (
          <Link to="/" onClick={logout}>
            Logout {user.username}{user.avatar}
          </Link>
        )}
      </nav>

      <Outlet />
    </div>
  );
}

export default Layout;
