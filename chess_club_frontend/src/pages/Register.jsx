// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting:", formData);  // DEBUG LINE

    try {
      const res = await axios.post('http://localhost:3001/register', {
        username: formData.username,
        password: formData.password
      });
      console.log('✅ Registered:', res.data);
      setMessage('✅ Registration successful! You can now log in.');
      setFormData({ username: '', password: '' });
    } catch (err) {
      if (err.response) {
        console.error('❌ Registration error:', err.response.data);
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        console.error('❌ Connection error:', err.message);
        setMessage('❌ Failed to connect to server');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register</h2>
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
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
