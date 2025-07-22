// src/pages/Register.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // clear any previous errors

    try {
      const res = await axios.post("http://localhost:3001/register", {
        username,
        password,
        email,
      });

      console.log("✅ Registered:", res.data);
      navigate("/login"); // redirect to login page
    } catch (err) {
      console.error("❌ Registration error:", err);
      if (err.response && err.response.status === 409) {
        setError("Username already taken.");
      } else if (err.response && err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
}

  };

  return (
    <div className="register-container" style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit">Register</button>
      </form>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}

export default Register;
