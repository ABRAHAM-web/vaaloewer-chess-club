import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import PlayerDashboard from './pages/PlayerDashboard';
import Standings from './pages/Standings';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Home />} />
          <Route path="standings" element={<Standings user={user} />} />
          <Route path="login" element={<Login setUser={setUser} />} />
          <Route path="register" element={<Register />} />
          <Route path="admin" element={<DashboardAdmin user={user} />} />
          <Route path="player/:playerId" element={<PlayerDashboard user={user} />} />
          <Route path="player-dashboard" element={<PlayerDashboard user={user} />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
