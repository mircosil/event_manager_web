// src/components/MainPage.jsx
import React, { useEffect, useState } from "react";
import { db, collection, getDocs, orderBy, query } from "../firebase";
import EventDetails from "./EventDetails";
import "./loginPage.css";

export default function MainPage() {
  const [events, setEvents] = useState([]);
  const [detailsEvent, setDetailsEvent] = useState(null);

  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = snap.docs.map((doc) => {
      const data = doc.data();
      // Alte (String) und neue (Objekt) Locations unterstützen
      const loc =
        typeof data.location === "string"
          ? { address: data.location, lat: null, lon: null }
          : data.location || null;
      return { id: doc.id, ...data, location: loc };
    });
    setEvents(items);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Deine lokalen Events</h1>

      <div className="event-card-container">
        {events.map((e) => (
          <div className="event-card card" key={e.id}>
            <img
              src={e.imageUrl || "./logo192.png"}
              className="card-img-top"
              alt={e.title}
            />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{e.title}</h5>
              {e.description && <p className="card-text">{e.description}</p>}

              {e.location && (
                <p className="card-text">
                  <strong>Ort:</strong>{" "}
                  {typeof e.location === "string"
                    ? e.location
                    : (e.location?.address || "")}
                </p>
              )}

              {(e.startDate || e.endDate) && (
                <p className="card-text">
                  <strong>Datum:</strong>{" "}
                  {e.startDate
                    ? new Date(e.startDate.seconds * 1000).toLocaleDateString()
                    : "?"}
                  {" - "}
                  {e.endDate
                    ? new Date(e.endDate.seconds * 1000).toLocaleDateString()
                    : "?"}
                </p>
              )}

              <div className="mt-auto">
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => setDetailsEvent(e)}
                >
                  Details ansehen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {detailsEvent && (
        <EventDetails event={detailsEvent} onClose={() => setDetailsEvent(null)} />
      )}
    </main>
  );
}

