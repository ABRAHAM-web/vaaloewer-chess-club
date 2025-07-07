import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PlayerDashboard({ user }) {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const effectivePlayerId = playerId ? parseInt(playerId) : user?.id;

  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If trying to view someone else, only allow admins
    if (parseInt(effectivePlayerId) !== user.id && user.role !== 'admin') {
      navigate('/');
      return;
    }

    axios.get(`http://localhost:3001/player/${effectivePlayerId}`)
      .then(res => {
        console.log('✅ Loaded player:', res.data);
        setPlayer(res.data);
      })
      .catch(err => console.error('❌ Error loading player:', err));

    axios.get(`http://localhost:3001/player/${effectivePlayerId}/games`)
      .then(res => {
        console.log('✅ Loaded games:', res.data);
        setGames(res.data);
      })
      .catch(err => console.error('❌ Error loading games:', err));

  }, [user, effectivePlayerId, navigate]);

  if (!player) return <div>Loading player data...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{player.username}'s Dashboard</h1>
      <p>Role: {player.role}</p>
      <p>Avatar: {player.avatar}</p>

      <h3>Games:</h3>
      {games.map(game => (
        <div key={game.id}>
          vs <strong>{game.opponent}</strong> 
          | Result: {game.result} 
          | Date: {new Date(game.date_played).toLocaleDateString()}
        </div>
      ))}
    </div>
  );
}

export default PlayerDashboard;
