// backend/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'chess_user',
  password: 'chess_club_password',
  database: 'chess_club',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
