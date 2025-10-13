import React, { useEffect, useState } from "react";
import { db, collection, getDocs, orderBy, query, } from "../firebase";

export default function MainPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setEvents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchEvents();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Willkommen!</h1>
      <p>Dies ist die Startseite.</p>
      <h1>Lokale Events</h1>
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
}