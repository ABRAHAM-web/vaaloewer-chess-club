import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PlayerDashboard({ userId }) {
  const { playerId } = useParams();
  const [games, setGames] = useState([]);
  const idToUse = playerId || userId;

  useEffect(() => {
    if (!idToUse) return;

    axios.get(`http://localhost:3001/player/${idToUse}/games`)
      .then((res) => {
        console.log('✅ Player games loaded:', res.data);
        setGames(res.data);
      })
      .catch((err) => console.error('❌ Failed to load player games:', err));
  }, [idToUse]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎯 Player Dashboard {playerId ? `(ID: ${playerId})` : ''}</h2>
      {games.length === 0 ? (
        <p>No games found for this player yet.</p>
      ) : (
        <ul>
          {games.map(game => (
            <li key={game.id}>
              vs <strong>{game.opponent}</strong> 
              - result: <em>{game.result}</em>
              - on {new Date(game.date_played).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerDashboard;
