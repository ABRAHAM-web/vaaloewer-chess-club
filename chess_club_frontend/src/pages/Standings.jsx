import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Standings({ user }) {
  const [standings, setStandings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/players/standings')
      .then(res => {
        console.log('✅ Standings loaded:', res.data);
        setStandings(res.data);
        setTimeout(() => setLoaded(true), 100);  // slight delay so animations trigger
      })
      .catch(err => console.error('❌ Error loading standings:', err));
  }, []);

  const handleClick = (player) => {
    if (!user) return;
    if (user.role === 'admin' || user.id === player.id) {
      navigate(`/player/${player.id}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Club Standings</h1>
      {standings.map((player, idx) => {
        // Score width relative to the highest score
        const maxPoints = standings[0]?.points || 1;
        const percent = (player.points / maxPoints) * 100;

        return (
          <div 
            key={player.id}
            onClick={() => handleClick(player)}
            style={{
              margin: '1rem 0',
              padding: '0.5rem 1rem',
              background: '#eee',
              borderRadius: '8px',
              cursor: (user && (user.role === 'admin' || user.id === player.id)) ? 'pointer' : 'default',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: loaded ? `${percent}%` : '0%',
                transition: 'width 1s ease-out',
                background: '#8b4513', // wood brown
                color: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              {player.username} - {player.points} pts 
              ({player.wins}W / {player.losses}L / {player.draws}D)
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Standings;
