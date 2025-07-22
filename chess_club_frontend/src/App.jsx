// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import PlayerDashboard from './pages/PlayerDashboard';
import Standings from './pages/Standings';
import Challenge from './pages/Challenge';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} setUser={setUser} />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login setUser={setUser} />} />
        <Route path="register" element={<Register />} />
        <Route path="admin" element={<DashboardAdmin />} />
        <Route path="player/:id" element={<PlayerDashboard />} />
        <Route path="standings" element={<Standings />} />
        <Route path="challenge" element={<Challenge />} />
      </Route>
    </Routes>
  );
}

export default App;
