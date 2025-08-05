import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthWrapper from '../components/AuthWrapper';

function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/auth/register', formData);
      alert('Registered successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('❌ Registration error:', err);
      alert('Registration failed');
    }
  };

  return (
    <AuthWrapper title="Register">
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input name="username" value={formData.username} onChange={handleChange} required />
        <label>Email</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </AuthWrapper>
  );
}

export default Register;
