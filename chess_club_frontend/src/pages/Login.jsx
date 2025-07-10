// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('🚀 Attempting login:', formData);

      // Send POST request to the login endpoint
      const response = await axios.post('http://localhost:3001/login', formData);

      console.log('✅ Login response:', response.data);

      // Store the user data in localStorage and update the state
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));  // Store the full user data
      setUser(user);  // Set the user in the state to update the UI

      setMessage('✅ Login successful! Redirecting...');
      console.log('🌍 Going to player-dashboard now...');
      navigate('/player-dashboard');  // Redirect to player dashboard after login
      console.log('✅ Navigation done');
    } catch (err) {
      console.error('❌ Login error:', err);
      setMessage('❌ Invalid username or password');  // Show error message if login fails
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
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Login
        </button>
      </form>

      {message && <p style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}  {/* Display error or success message */}
    </div>
  );
}

export default Login;
