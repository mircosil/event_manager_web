// src/components/EventDetails.jsx
import React from "react";
import { createPortal } from "react-dom";
import "./eventModal.css";
import { CATEGORY_OPTIONS } from "../constants/categories";

export default function EventDetails({ event, onClose }) {
  if (!event) return null;

  // Datum robust lesen
  const start = event.startDate?.seconds
    ? new Date(event.startDate.seconds * 1000)
    : null;
  const end = event.endDate?.seconds
    ? new Date(event.endDate.seconds * 1000)
    : null;

  // Adresse robust lesen (String oder Objekt)
  const address =
    typeof event.location === "string"
      ? event.location
      : (event.location?.address || "");

  // Kategorien lesen & in Labels übersetzen
  const categories = Array.isArray(event.categories) ? event.categories : [];
  const labelByKey = Object.fromEntries(
    CATEGORY_OPTIONS.map((o) => [o.key, o.label])
  );

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

            <div style={{ marginTop: 8 }}>
              <h4 style={{ margin: "0 0 6px" }}>{event.title}</h4>
              {event.description && (
                <p style={{ margin: 0 }}>{event.description}</p>
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <p style={{ margin: "6px 0" }}>
                <strong>Ort:</strong> {address || "—"}
              </p>
              <p style={{ margin: "6px 0" }}>
                <strong>Datum:</strong>{" "}
                {start ? start.toLocaleDateString() : "?"} –{" "}
                {end ? end.toLocaleDateString() : "?"}
              </p>
            </div>

            {/* Kategorien (read-only Badges) */}
            {categories.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Kategorien
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {categories.map((key) => (
                    <span
                      key={key}
                      className="badge"
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: "#eef2ff",
                        color: "#1e3a8a",
                        borderRadius: 999,
                        fontSize: ".85rem",
                      }}
                    >
                      {labelByKey[key] ?? key}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Optionale rechte Spalte, z.B. read-only Karte */}
          <section className="event-right"></section>
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


