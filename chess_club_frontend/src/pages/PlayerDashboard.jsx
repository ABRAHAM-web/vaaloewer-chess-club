// src/pages/PlayerDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PlayerDashboard() {
  const { id } = useParams(); // URL param (as string)
  const user = JSON.parse(localStorage.getItem('user'));
  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedPlayer, setUpdatedPlayer] = useState({});

  const isSelf = parseInt(id) === user?.id;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!id) return;

    // Fetch player info
    axios.get(`http://localhost:3001/player/${id}`)
      .then((res) => {
        setPlayer(res.data);
        setUpdatedPlayer(res.data);
      })
      .catch((err) => {
        console.error('❌ Error loading player:', err);
        setError('Could not load player');
      });

    // Fetch games
    axios.get(`http://localhost:3001/player/${id}/games`)
      .then((res) => setGames(res.data))
      .catch((err) => {
        console.error('❌ Error loading games:', err);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedPlayer((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const savePlayer = () => {
    axios.put(`http://localhost:3001/player/${id}`, updatedPlayer)
      .then((res) => {
        setPlayer(res.data);
        setEditing(false);
      })
      .catch((err) => {
        console.error('❌ Update failed:', err);
        alert('Update failed');
      });
  };

  if (!user) return <div>🔒 Please log in.</div>;
  if (error) return <div>❌ {error}</div>;
  if (!player) return <div>⏳ Loading player...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Player Dashboard: {player.username}</h2>

      <p><strong>Email:</strong> {editing ? (
        <input type="text" name="email" value={updatedPlayer.email || ''} onChange={handleChange} />
      ) : player.email}</p>

      <p><strong>Avatar:</strong> {editing ? (
        <select name="avatar" value={updatedPlayer.avatar || ''} onChange={handleChange}>
          <option value="">Select Avatar</option>
          <option value="👑">👑</option>
          <option value="🐉">🐉</option>
          <option value="😂">😂</option>
          <option value="LOL">LOL</option>
        </select>
      ) : player.avatar}</p>

      <p><strong>Availability:</strong> {editing ? (
        <label>
          <input
            type="checkbox"
            name="is_available"
            checked={!!updatedPlayer.is_available}
            onChange={handleChange}
          /> Available
        </label>
      ) : player.is_available ? 'Available' : 'Not available'}</p>

      <p><strong>Role:</strong> {editing && isAdmin ? (
        <select name="role" value={updatedPlayer.role} onChange={handleChange}>
          <option value="player">Player</option>
          <option value="admin">Admin</option>
        </select>
      ) : player.role}</p>

      {(isAdmin || isSelf) && (
        <div>
          {editing ? (
            <button onClick={savePlayer}>Save</button>
          ) : (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>
      )}

      <h3>Game History</h3>
      {games.length === 0 ? (
        <p>No games found</p>
      ) : (
        <ul>
          {games.map((game) => (
            <li key={game.id}>
              vs <strong>{game.opponent_username || 'unknown'}</strong> | Result: {game.result} | {new Date(game.date_played).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerDashboard;
