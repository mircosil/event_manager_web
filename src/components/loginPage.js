import React, { useState, useEffect } from "react";
import './loginPage.css';
import EventModal from "./EventModal";
import { db, collection, getDocs, orderBy, query, } from "../firebase";


export default function LoginPage() {
  const[showModal, setShowModal] = React.useState(false);
  const [events, setEvents] = React.useState([]);

  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setEvents(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Willkommen!</h1>
      <p>Diese Seite ist nur nach dem Login sichtbar.</p>

      <div className="add-event-container">
        <button className="add-button" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-square"></i>Event hinzufügen
        </button>
      </div>

      {showModal && (
        <EventModal
          onClose={() => setShowModal(false)}
          onEventAdded={fetchEvents}
        />
      )}

      <h2>📅 Deine Events</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            <strong>{e.title}</strong> – {e.location} ({e.date})
            <p>{e.description}</p>
          </li>
        ))}
      </ul>
    </main>

  );
};