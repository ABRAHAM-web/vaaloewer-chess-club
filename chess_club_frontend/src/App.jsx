import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import PlayerDashboard from './pages/PlayerDashboard';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Admin dashboard - only for admins */}
          <Route path="admin" element={
            user && user.role === 'admin'
              ? <DashboardAdmin />
              : <Navigate to="/" />
          } />

          {/* Logged-in player's own dashboard */}
          <Route path="player-dashboard" element={
            user && user.role === 'player'
              ? <PlayerDashboard userId={user.id} />
              : <Navigate to="/" />
          } />

          {/* Admins viewing any player's dashboard */}
          <Route path="player/:playerId" element={
            user && user.role === 'admin'
              ? <PlayerDashboard />
              : <Navigate to="/player-dashboard" />
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
