// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [standings, setStandings] = useState([]);
  const [maxPoints, setMaxPoints] = useState(1); // avoid divide by zero

  useEffect(() => {
    axios.get('http://localhost:3001/players/standings')
      .then((res) => {
        setStandings(res.data);
        // find the highest points to normalize bar width
        const max = res.data.length > 0 ? Math.max(...res.data.map(p => p.points)) : 1;
        setMaxPoints(max || 1);
      })
      .catch((err) => {
        console.error('⚠️ Failed to fetch standings:', err);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🏆 Chess Club Standings</h1>
      {standings.map((player, index) => (
        <div 
          key={player.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.8rem',
            background: '#f0f0f0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <div style={{
            background: '#4caf50',
            width: `${(player.points / maxPoints) * 100}%`,
            padding: '0.5rem',
            color: '#fff',
            fontWeight: 'bold'
          }}>
            {index + 1}. {player.username} 
          </div>
          <div style={{
            marginLeft: 'auto',
            padding: '0 1rem',
            fontWeight: 'bold'
          }}>
            {player.points} pts
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
