import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <header>
        <h1>♟️ Chess Club</h1>
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link> |{" "}
          <Link to="/admin">Admin</Link>
        </nav>
      </header>

      <main>
        <Outlet /> {/* ✅ This renders the route content */}
      </main>
    </div>
  );
}

export default Layout; // ✅ Don't forget this!
