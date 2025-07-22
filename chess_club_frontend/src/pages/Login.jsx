// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    console.log("🚀 Attempting login:", formData);

    axios.post('http://localhost:3001/login', formData)
      .then((res) => {
        const user = res.data.user;
        console.log("✅ Login success:", user);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user); // ✅ Set the logged-in user in app state
        navigate(`/player/${user.id}`); // Go to player dashboard
      })
      .catch((err) => {
        console.error("❌ Login error:", err);
        setError('Login failed: ' + (err.response?.data?.message || 'Unknown error'));
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label><br />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password:</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
      </form>
    </div>
  );
}

export default Login;
