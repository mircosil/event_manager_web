import React from "react";
import './loginPage.css';


export default function LoginPage() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Willkommen!</h1>
      <p>Diese Seite ist nur nach dem Login sichtbar.</p>

      <div className="add-event-container">
        <button className="add-button"><i class="bi bi-plus-square"></i>Event hinzufügen</button>
      </div>

    </main>



  );
};