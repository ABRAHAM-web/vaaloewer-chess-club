import React from 'react';
import '../styles/AuthForm.css';

function AuthWrapper({ title, children }) {
  return (
    <div className="auth-container">
      <h2 className="auth-title">{title}</h2>
      <div className="auth-form">{children}</div>
    </div>
  );
}

export default AuthWrapper;
