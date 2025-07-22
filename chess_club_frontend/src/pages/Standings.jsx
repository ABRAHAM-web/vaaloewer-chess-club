// src/pages/Standings.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Standings() {
  const [standings, setStandings] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    axios.get('http://localhost:3001/players/standings')
      .then(res => setStandings(res.data))
      .catch(err => {
        console.error('❌ Error loading standings:', err);
        setError('Failed to load standings');
      });
  }, []);

  if (error) return <div>❌ {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🏆 Player Standings</h2>
      {standings.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <div>
          {standings.map((player, index) => {
            const percentage = (player.points / standings[0].points) * 100;

            return (
              <div
                key={player.id}
                onClick={() => isAdmin && navigate(`/player/${player.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  cursor: isAdmin ? 'pointer' : 'default',
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  width: `${percentage}%`,
                  background: '#4caf50',
                  padding: '1rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {player.username}
                </div>
                <div style={{ marginLeft: 'auto', padding: '1rem', fontWeight: 'bold' }}>
                  {player.points} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Standings;
