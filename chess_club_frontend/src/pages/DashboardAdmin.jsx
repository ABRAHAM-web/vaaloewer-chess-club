import React, { useState, useEffect } from 'react';
import AddGameForm from '../components/AddGameForm';
import GameList from '../components/GameList';
import axios from 'axios';

function DashboardAdmin() {
  const [games, setGames] = useState([]);

  const fetchGames = () => {
    axios.get('http://localhost:3001/admin/games')
      .then(res => {
        console.log('✅ Games loaded:', res.data);
        setGames(res.data);
      })
      .catch(err => console.error('❌ Failed to load games:', err));
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div style={{ padding: '2rem', background: 'red' }}>
      <h1>🛡️ Admin Dashboard</h1>
      <p>This is the admin area.</p>
      <AddGameForm onGameAdded={fetchGames} />
      <GameList games={games} />
    </div>
  );
}

export default DashboardAdmin;
