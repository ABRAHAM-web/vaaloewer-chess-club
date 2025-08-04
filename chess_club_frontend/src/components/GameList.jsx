// src/components/GameList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function GameList() {
  const [games, setGames] = useState([]);
  const [message, setMessage] = useState('');

  // Fetching games when the component mounts
  useEffect(() => {
    axios.get('http://localhost:3001/games')
      .then((res) => {
        console.log('✅ Games loaded:', res.data);
        setGames(res.data);
      })
      .catch((err) => {
        console.error('⚠️ Error fetching games:', err);
        setMessage('⚠️ Failed to load games');  // Set error message if fetching fails
      });
  }, []);

  // Helper function to get a color based on the game result
  const getResultStyle = (result) => {
    if (result === '1-0') return { color: 'green', fontWeight: 'bold' };
    if (result === '0-1') return { color: 'red', fontWeight: 'bold' };
    if (result === '½-½') return { color: 'gray', fontWeight: 'bold' };
    return {};
  };

  return (
    <div style={{
      background: '#e0e0e0',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '2rem'
    }}>
      <h3>All Past Games</h3>

      {/* Display error message if any */}
      {message && <p>{message}</p>}

      {/* Display games in a table if available */}
      {games.length === 0 ? (
        <p>No games have been recorded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#ccc' }}>
              <th>ID</th>
              <th>White</th>
              <th>Black</th>
              <th>Result</th>
              <th>Date Played</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id} style={{ textAlign: 'center' }}>
                <td>{game.id}</td>
                <td>{game.white_player}</td>
                <td>{game.black_player}</td>
                {/* Applying the result color style */}
                <td style={getResultStyle(game.result)}>
                  {game.result}
                </td>
                <td>{new Date(game.date_played).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GameList;
