import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function Challenge() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus] = useState('');

  const handleMove = (sourceSquare, targetSquare) => {
    const newGame = new Chess(game.fen());
    const move = newGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });

    if (move === null) {
      return false;
    }

    setGame(newGame);
    setFen(newGame.fen());

    if (newGame.isCheckmate()) {
      setStatus('Checkmate!');
    } else if (newGame.isDraw()) {
      setStatus('Draw!');
    } else if (newGame.isStalemate()) {
      setStatus('Stalemate!');
    } else if (newGame.isThreefoldRepetition()) {
      setStatus('Draw by repetition!');
    } else {
      setStatus('');
    }

    return true;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '2rem', padding: '2rem' }}>
      <div>
        <Chessboard position={fen} onPieceDrop={handleMove} boardWidth={400} />
        {status && <div style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{status}</div>}
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          background: '#f4f4f4',
          borderRadius: '6px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          <strong>Move Log:</strong>
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {game.history().map((move, idx) => (
              <li key={idx}>{move}</li>
            ))}
          </ol>
        </div>
      </div>

      <div style={{
        minWidth: '200px',
        padding: '1rem',
        background: '#f4f4f4',
        borderRadius: '8px',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3>Available Players</h3>
        <p>(coming soon...)</p>
      </div>
    </div>
  );
}

export default Challenge;
