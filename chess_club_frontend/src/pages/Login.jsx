import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
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
    console.log('🚀 Logging in with:', formData);

    try {
      const res = await axios.post('http://localhost:3001/login', formData);
      console.log('✅ Login success:', res.data);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage(`✅ Welcome, ${res.data.user.username}!`);

      // 🚀 Redirect based on role
    if (res.data.user.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/player-dashboard';
    }

    } catch (err) {
      if (err.response) {
        console.error('❌ Login error:', err.response.data);
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        console.error('❌ Connection error:', err.message);
        setMessage('❌ Failed to connect to server');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="username" 
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        /><br /><br />
        <input 
          type="password" 
          name="password" 
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        /><br /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
