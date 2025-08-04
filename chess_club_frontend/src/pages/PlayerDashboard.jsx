// src/pages/PlayerDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PlayerDashboard() {
  const { id } = useParams(); // ID uit die URL
  const loggedInUser = JSON.parse(localStorage.getItem('user')); // Ingelogde gebruiker
  const [player, setPlayer] = useState(null);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedPlayer, setUpdatedPlayer] = useState({});

  const actualId = id || loggedInUser?.id;

  function getPerspectiveResult(game, playerUsername) {
      const isWhite = game.white_player === playerUsername;
      const result = game.result;

      if (result === '½-½') return '½-½';
      if ((result === '1-0' && isWhite) || (result === '0-1' && !isWhite)) return 'Win';
      if ((result === '0-1' && isWhite) || (result === '1-0' && !isWhite)) return 'Loss';
  return result; // fallback
  }



  useEffect(() => {
    if (!actualId) return;

    // Fetch player info
    axios.get(`http://localhost:3001/players/${actualId}`)
      .then((res) => {
        setPlayer(res.data);
        setUpdatedPlayer(res.data);
      })
      .catch((err) => {
        console.error('❌ Error loading player:', err);
        setError('Could not load player');
      });

    // Fetch games
    axios.get(`http://localhost:3001/players/${actualId}/games`)
      .then((res) => {
        console.log("📅 Game dates:", res.data.map(g => g.date_played));
        setGames(res.data);
      })
  }, [actualId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedPlayer((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const savePlayer = () => {
    axios.put(`http://localhost:3001/player/${actualId}`, updatedPlayer)
      .then((res) => {
        setPlayer(res.data);
        setEditing(false);
      })
      .catch((err) => {
        console.error('❌ Update failed:', err);
        alert('Update failed');
      });
  };

  if (error) return <div>{error}</div>;
  if (!player) return <div>Loading Player...</div>;

  const isAdmin = loggedInUser?.role === 'admin';
  const isSelf = loggedInUser?.id === player.id;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Player Dashboard: {player.username}</h2>

      <p><strong>Email:</strong> {editing ? (
        <input
          type="text"
          name="email"
          value={updatedPlayer.email || ''}
          onChange={handleChange}
        />
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

      <h3 style={{ marginTop: '2rem' }}>Game History</h3>
      {games.length === 0 ? (
        <p>No games found</p>
      ) : (
        <ul>
        {games.map((game) => {
          const opponent =
            game.white_player === player.username
              ? game.black_player
              : game.white_player;

          const formattedDate = game.date_played
            ? new Date(game.date_played).toLocaleDateString()
            : 'No Date';

          return (
            <li key={game.id}>
              vs <strong>{opponent}</strong> | Result: {getPerspectiveResult(game, player.username)}| {formattedDate}
            </li>
          );
        })}


        </ul>
      )}
    </div>
  );  
}

export default PlayerDashboard;
