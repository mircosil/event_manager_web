import React, { useState, useEffect } from "react";
import "./loginPage.css";
import EventModal from "./EventModal";
import { db, collection, getDocs, orderBy, query } from "../firebase";

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    // Location robust normalisieren (String -> Objekt)
    const items = snap.docs.map((doc) => {
      const data = doc.data();
      const loc =
        typeof data.location === "string"
          ? { address: data.location }
          : data.location || null;
      return { id: doc.id, ...data, location: loc };
    });

    setEvents(items);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAdd = () => {
    setSelectedEvent(null);
    setShowModal(true);
  };

  const openEdit = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedEvent(null); // wichtig damit Add danach leer ist
  };

  return (
    <main style={{ padding: 20 }}>
      <div className="add-event-container">
        <button className="add-button" onClick={openAdd}>
          <i className="bi bi-plus-square" /> Event hinzufügen
        </button>
      </div>

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
                  <strong>Ort:</strong>{" "}
                  {typeof e.location === "string"
                    ? e.location
                    : e.location?.address}
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
                  onClick={() => openEdit(e)}
                >
                  Event bearbeiten
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <EventModal
          initialEvent={selectedEvent}
          onClose={handleClose}
          onEventAdded={fetchEvents}
        />
      )}
    </main>
  );
}
