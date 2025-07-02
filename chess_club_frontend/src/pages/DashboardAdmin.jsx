// // src/pages/DashboardAdmin.jsx
// import React from 'react';

// function DashboardAdmin() {
//   return (
//     <div style={{ padding: '2rem' }}>
//       <h1>🛡️ Admin Dashboard</h1>
//       <p>This is the admin area.</p>
//     </div>
//   );
// }

// export default DashboardAdmin;
// src/pages/DashboardAdmin.jsx
import React from 'react';
import AddGameForm from '../components/AddGameForm';


function DashboardAdmin() {
  return (
    <div style={{ padding: '2rem', background: 'red' }}>
      <h1>🛡️ Admin Dashboard</h1>
      <p>This is the admin area.</p>
      <AddGameForm />
    </div>
  );
}

export default DashboardAdmin;
