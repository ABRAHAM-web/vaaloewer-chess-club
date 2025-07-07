import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Standings({ user }) {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/players/standings')
      .then(res => {
        console.log('✅ Standings loaded:', res.data);
        setStandings(res.data);
      })
      .catch(err => console.error('❌ Error loading standings:', err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Player Standings</h1>
      {standings.map(player => {
        const canClick = user && (user.role === 'admin' || user.id === player.id);

        const barContent = (
          <div style={{
            background: '#eee',
            margin: '0.5rem 0',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#ddd'}
          onMouseOut={(e) => e.currentTarget.style.background = '#eee'}
          >
            <strong>{player.username}</strong> 
            {' '}| Points: {player.points}
            {' '}| Wins: {player.wins}
            {' '}| Losses: {player.losses}
            {' '}| Draws: {player.draws}
            {' '}| Games: {player.total_games}
          </div>
        );

        return canClick ? (
          <Link 
            key={player.id}
            to={`/player/${player.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {barContent}
          </Link>
        ) : (
          <div key={player.id}>
            {barContent}
          </div>
        );
      })}
    </div>
  );
}

export default Standings;
