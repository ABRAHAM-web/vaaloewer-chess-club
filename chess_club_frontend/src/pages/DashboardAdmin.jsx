import React, { useState, useEffect } from 'react';
import AddGameForm from '../components/AddGameForm';
import GameList from '../components/GameList';
import axios from 'axios';

function DashboardAdmin({ user }) {
  const [games, setGames] = useState([]);

  const loadGames = () => {
    axios.get('http://localhost:3001/admin/games')
      .then(res => {
        console.log('✅ Games loaded:', res.data);
        setGames(res.data);
      })
      .catch(err => console.error('❌ Failed to load games:', err));
  };

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🛡️ Admin Dashboard</h1>
      <AddGameForm onGameAdded={loadGames} />
      <GameList games={games} />
    </div>
  );
}

export default DashboardAdmin;
