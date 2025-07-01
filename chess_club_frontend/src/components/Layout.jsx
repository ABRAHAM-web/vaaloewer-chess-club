import { Link } from 'react-router-dom';

function Layout() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <header style={styles.header}>
      <h1 style={styles.logo}>♟️ Chess Club</h1>
      <nav>
        {user ? (
          <div style={styles.avatarBox}>
            <span>{user.username}</span>
            <span style={styles.roleTag}>{user.role}</span>
          </div>
        ) : (
          <>
            <Link style={styles.link} to="/login">Login</Link>
            <Link style={styles.link} to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem', backgroundColor: '#222', color: '#fff'
  },
  logo: { fontSize: '1.5rem' },
  link: { color: '#fff', marginLeft: '1rem', textDecoration: 'none' },
  avatarBox: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  roleTag: {
    backgroundColor: '#555', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '5px'
  }
};

export default Layout;
