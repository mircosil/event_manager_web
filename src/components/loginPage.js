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
              <p className="card-text">{e.description}</p>

              {e.location && (
                <p className="card-text">
                  <strong>Ort:</strong> {e.location}
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
                <a href="#" className="btn btn-primary w-100">
                  Details ansehen
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>

  );
};