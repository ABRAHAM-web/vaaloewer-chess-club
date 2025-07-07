import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('🚀 Attempting login:', formData);
      const res = await axios.post('http://localhost:3001/login', formData);
      console.log('✅ Login response:', res.data);

      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      setMessage('✅ Login successful! Redirecting...');
      // ✅ Redirect all users (admin + players) to their own player dashboard
      navigate('/player-dashboard');

    } catch (err) {
      console.error('❌ Login error:', err);
      setMessage('❌ Invalid username or password');
    }
  };

  return (
    <div style={{ 
      background: '#f9f9f9', 
      padding: '2rem', 
      borderRadius: '8px', 
      maxWidth: '400px', 
      margin: '2rem auto' 
    }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <input 
          type="password" 
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
        />
        <button type="submit">Login</button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default Login;
