import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlayerDashboard() {
  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:3001/player/${user.id}`)
        .then(res => setPlayer(res.data))
        .catch(err => console.error('❌ Error loading player:', err));

      axios.get(`http://localhost:3001/player/${user.id}/games`)
        .then(res => setGames(res.data))
        .catch(err => console.error('❌ Error loading games:', err));
    }
  }, [user]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      {player && (
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2>{player.username}'s Dashboard</h2>
          <p><strong>Points:</strong> {player.points}</p>
          <p><strong>Wins:</strong> {player.wins} | <strong>Losses:</strong> {player.losses} | <strong>Draws:</strong> {player.draws}</p>
          <p><strong>Total Games:</strong> {player.total_games}</p>
        </div>
      )}

      <div>
        <h3>Game History</h3>
        {games.length === 0 && <p>No games played yet.</p>}
        {games.map(game => (
          <div key={game.id} style={{
            background: '#fafafa',
            margin: '0.5rem 0',
            padding: '0.8rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '0.95rem'
          }}>
            <strong>{game.white_player}</strong> vs <strong>{game.black_player}</strong>
            &nbsp;| Result: {game.result}
            &nbsp;| {new Date(game.date_played).toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerDashboard;
