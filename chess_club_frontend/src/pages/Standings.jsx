// src/pages/Standings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Standings() {
  const [standings, setStandings] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get('http://localhost:3001/players/standings')
      .then(res => {
        console.log('✅ Standings loaded:', res.data);
        setStandings(res.data);
      })
      .catch(err => {
        console.error('❌ Error loading standings:', err);
      });
  }, []);

  const maxPoints = standings.length > 0 ? Math.max(...standings.map(p => p.points)) : 1;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Player Standings</h2>

      {standings.length === 0 && <p>No data available.</p>}

      {standings.map(player => {
        const clickable = user && (user.id === player.id || user.role === 'admin');
        const barWidth = (player.points / maxPoints) * 100;

        return (
          <div
            key={player.id}
            onClick={() => clickable && navigate(`/player-dashboard/${player.id}`)}
            style={{
              background: '#fafafa',
              margin: '1rem 0',
              padding: '1rem',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              cursor: clickable ? 'pointer' : 'default',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => clickable && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => clickable && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{
              height: '25px',
              width: `${barWidth}%`,
              background: 'linear-gradient(90deg, #4caf50, #81c784)',
              borderRadius: '6px',
              transition: 'width 0.4s'
            }}></div>
            
            <div style={{ marginTop: '0.8rem', fontSize: '0.95rem' }}>
              <strong>{player.username}</strong>
              &nbsp;| Points: {player.points}
              &nbsp;| Wins: {player.wins}
              &nbsp;| Losses: {player.losses}
              &nbsp;| Draws: {player.draws}
              &nbsp;| Total: {player.total_games}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Standings;
