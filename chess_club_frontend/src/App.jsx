// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import PlayerDashboard from './pages/PlayerDashboard';
import Challenge from './pages/Challenge';
import Standings from './pages/Standings';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Home />} />
          <Route path="standings" element={<Standings />} />
          <Route path="login" element={<Login setUser={setUser} />} />
          <Route path="register" element={<Register setUser={setUser} />} />
          <Route path="admin" element={<DashboardAdmin />} />
          <Route path="player-dashboard" element={<PlayerDashboard />} />
          <Route path="challenge" element={<Challenge />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
