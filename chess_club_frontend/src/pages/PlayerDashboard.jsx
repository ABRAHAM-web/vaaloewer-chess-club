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

    // Only allow access if the user is viewing their own or is admin
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {games.map(game => {
          const playerId = parseInt(player.id);
          const whiteId = parseInt(game.white_player_id);
          const blackId = parseInt(game.black_player_id);

          let outcome = 'Draw';
          let icon = '➗';
          let color = '#999';

          if (
            (game.result === '1-0' && whiteId === playerId) ||
            (game.result === '0-1' && blackId === playerId)
          ) {
            outcome = 'Won';
            icon = '✅';
            color = 'green';
          } else if (
            (game.result === '1-0' && blackId === playerId) ||
            (game.result === '0-1' && whiteId === playerId)
          ) {
            outcome = 'Lost';
            icon = '❌';
            color = 'darkred';
          }

          return (
            <div 
              key={game.id} 
              style={{ 
                border: '1px solid #ccc', 
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                  vs <strong>{game.opponent}</strong>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {new Date(game.date_played).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', color }}>
                {icon} {outcome}
              </div>
            </div>
          );
        })}
</div>




    </div>
  );
}

export default PlayerDashboard;
