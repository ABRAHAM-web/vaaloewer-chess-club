// src/pages/Challenge.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function Challenge({ user }) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);

  // Load available players excluding self
  useEffect(() => {
    if (!user || !user.id) return;

    axios.get('http://localhost:3001/players/available', {
      params: { exclude: user.id }
    })
      .then(res => setAvailablePlayers(res.data))
      .catch(err => console.error('❌ Error loading players:', err));
  }, [user]);

  // Load incoming challenges for logged in player
  useEffect(() => {
    if (!user?.id) return;

    axios.get(`http://localhost:3001/challenges/pending/${user.id}`)
      .then(res => setPendingChallenges(res.data))
      .catch(err => console.error('❌ Error loading challenges:', err));
  }, [user]);

  const sendChallenge = async (opponentId) => {
    try {
      await axios.post('http://localhost:3001/challenges/send', {
        challenger_id: user.id,
        challenged_id: opponentId
      });
      alert('Challenge sent!');
    } catch (err) {
      console.error('❌ Challenge failed:', err);
    }
  };

  const respondToChallenge = async (challengeId, status) => {
    try {
      await axios.put(`http://localhost:3001/challenges/${challengeId}/respond`, {
        status
      });
      alert(`Challenge ${status}`);
      // Refresh challenges
      const res = await axios.get(`http://localhost:3001/challenges/pending/${user.id}`);
      setPendingChallenges(res.data);
    } catch (err) {
      console.error('❌ Response failed:', err);
    }
  };

  const handleMove = (sourceSquare, targetSquare) => {
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (move === null) return false;

    setGame(newGame);
    setFen(newGame.fen());

    if (newGame.isGameOver()) {
      if (newGame.isCheckmate()) setStatus('Checkmate!');
      else if (newGame.isDraw()) setStatus('Draw!');
      else setStatus('Game over');
    } else {
      setStatus('');
    }
    return true;
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      {/* Chessboard */}
      <div>
        <Chessboard position={fen} onPieceDrop={handleMove} boardWidth={400} />
        {status && <div style={{ marginTop: '1rem' }}>{status}</div>}
        <div>
          <strong>Moves:</strong>
          <ol>{game.history().map((move, idx) => <li key={idx}>{move}</li>)}</ol>
        </div>
      </div>

      {/* Sidebar: Available Players and Challenges */}
      <div style={{ minWidth: '280px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3>Available Players</h3>
          {availablePlayers.length === 0 ? (
            <p>No players available.</p>
          ) : (
            availablePlayers.map(p => (
              <div key={p.id} style={{ marginBottom: '0.5rem' }}>
                {p.username} <button onClick={() => sendChallenge(p.id)}>Challenge</button>
              </div>
            ))
          )}
        </div>

        <div>
          <h3>Incoming Challenges</h3>
          {pendingChallenges.length === 0 ? (
            <p>No challenges.</p>
          ) : (
            pendingChallenges.map(c => (
              <div key={c.id} style={{ marginBottom: '1rem' }}>
                <div><strong>{c.challenger_name}</strong> challenged you!</div>
                <button onClick={() => respondToChallenge(c.id, 'accepted')}>Accept</button>{' '}
                <button onClick={() => respondToChallenge(c.id, 'declined')}>Decline</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Challenge;
