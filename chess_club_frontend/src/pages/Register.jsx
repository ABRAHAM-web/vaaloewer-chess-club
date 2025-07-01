// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'player' // default role
  });

  const [message, setMessage] = useState('');

  // Update form values
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/register', formData);
      setMessage('✅ Registration successful!');
      setFormData({ username: '', password: '', role: 'player' }); // Clear form
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage('⚠️ Username already exists.');
      } else {
        setMessage('❌ Registration failed. Please try again.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br />

        <label>
          Role:
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="player">Player</option>
            <option value="admin">Admin</option>
          </select>
        </label><br /><br />

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;