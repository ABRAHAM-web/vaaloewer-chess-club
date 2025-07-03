import React from "react";
import AddGameForm from "../components/AddGameForm";
import GameList from "../components/GameList";

function DashboardAdmin() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <AddGameForm />
      <GameList />
    </div>
  );
}

export default DashboardAdmin;
