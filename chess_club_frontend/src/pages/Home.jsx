function Home() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h2>Welcome to the Chess Club!</h2>
      {user ? (
        <p>You are logged in as <strong>{user.username}</strong> ({user.role})</p>
      ) : (
        <p>Please login or register to continue.</p>
      )}
    </div>
  );
}

export default Home;
