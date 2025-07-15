import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PlayerDashboard() {
  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const { playerId } = useParams();
  const effectiveId = playerId || user?.id;

  useEffect(() => {
    if (!effectiveId) return;

    axios.get(`http://localhost:3001/player/${effectiveId}`)
      .then(res => setPlayer({
        ...res.data,
        available: res.data.is_available === 1
      }))
      .catch(err => {
        console.error('❌ Error loading player:', err.response?.data || err.message);
        setError('Error loading player data');
      });

    axios.get(`http://localhost:3001/player/${effectiveId}/games`)
      .then(res => setGames(res.data))
      .catch(err => {
        console.error('❌ Error loading games:', err.response?.data || err.message);
        setError('Error loading games');
      });
  }, [effectiveId]);

  const savePlayer = async () => {
    try {
      const payload = {
        email: player.email,
        avatar: player.avatar || '',
        is_available: player.available ? 1 : 0,
        role: player.role || 'player'
      };
      console.log('🚀 Updating with payload:', payload);
      await axios.post(`http://localhost:3001/player/${player.id}/update`, payload);
      alert('✅ Player updated successfully!');
    } catch (err) {
      console.error('❌ Update failed:', err);
      alert('❌ Update failed');
    }
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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
          <p>
            <strong>Email:</strong>
            <input 
              type="email"
              value={player.email}
              onChange={e => setPlayer({ ...player, email: e.target.value })}
              style={{ marginLeft: '0.5rem' }}
            />
          </p>
          <p>
            <strong>Avatar:</strong>
            <select 
              value={player.avatar || ''}
              onChange={e => setPlayer({ ...player, avatar: e.target.value })}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="">None</option>
              <option value="👑">👑 King</option>
              <option value="♛">♛ Queen</option>
              <option value="🐴">🐴 Knight</option>
              <option value="🐉">🐉 Dragon</option>
              <option value="LOL">LOL</option>
            </select>
          </p>
          <p>
            <strong>Available:</strong>
            <input 
              type="checkbox"
              checked={player.available}
              onChange={e => setPlayer({ ...player, available: e.target.checked })}
            />
          </p>
          <p>
            <strong>Role:</strong>
            {user && user.role === 'admin' ? (
              <select 
                value={player.role}
                onChange={e => setPlayer({ ...player, role: e.target.value })}
                style={{ marginLeft: '0.5rem' }}
              >
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <span style={{ marginLeft: '0.5rem' }}>{player.role}</span>
            )}
          </p>

          <p><strong>Points:</strong> {player.points}</p>
          <p><strong>Wins:</strong> {player.wins} | <strong>Losses:</strong> {player.losses} | <strong>Draws:</strong> {player.draws}</p>
          <p><strong>Total Games:</strong> {player.total_games}</p>

          <button onClick={savePlayer} style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Save Changes
          </button>
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
