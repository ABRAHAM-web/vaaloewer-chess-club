import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Register() {
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
      console.log('🚀 Attempting registration:', formData);
      const res = await axios.post('http://localhost:3001/register', formData);
      console.log('✅ Registration response:', res.data);

      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);

    } catch (err) {
      console.error('❌ Registration error:', err);
      setMessage(`❌ ${err.response?.data?.message || 'Registration failed'}`);
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

      <h1>Register</h1>
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
        <button type="submit">Register</button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default Register;
