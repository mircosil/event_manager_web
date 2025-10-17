// src/components/EventDetails.jsx
import React from "react";
import { createPortal } from "react-dom";
import "./eventModal.css";

export default function EventDetails({ event, onClose }) {
  if (!event) return null;

  const start = event.startDate?.seconds
    ? new Date(event.startDate.seconds * 1000)
    : null;
  const end = event.endDate?.seconds
    ? new Date(event.endDate.seconds * 1000)
    : null;

  // Adresse direkt ableiten (String-kompatibel + Objekt-kompatibel)
  const address =
    typeof event.location === "string"
      ? event.location
      : (event.location?.address || "");

  const modal = (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Event</h2>

        <div className="event-layout">
          <section className="event-left">
            <img
              src={event.imageUrl || "./logo192.png"}
              alt="Event"
              className="event-modal-image"
            />

            <div>
              <h4 style={{ margin: "0 0 6px" }}>{event.title}</h4>
              {event.description && <p style={{ margin: 0 }}>{event.description}</p>}
            </div>

            <div>
              <p style={{ margin: "6px 0" }}>
                <strong>Ort:</strong> {address}
              </p>
              <p style={{ margin: "6px 0" }}>
                <strong>Datum:</strong>{" "}
                {start ? start.toLocaleDateString() : "?"} -{" "}
                {end ? end.toLocaleDateString() : "?"}
              </p>
            </div>
          </section>

          <section className="event-right">{/* optional: read-only Karte */}</section>
        </div>

        <div className="event-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

