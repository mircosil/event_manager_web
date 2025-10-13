// src/components/EventModal.js
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { db, auth, collection, addDoc, serverTimestamp } from "../firebase";
import "./eventModal.css";

export default function EventModal({ onClose, onEventAdded }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Bitte zuerst einloggen.");

    await addDoc(collection(db, "events"), {
      title,
      location,
      date,
      description,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    onEventAdded?.();
    onClose?.();
  };

  const modal = (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Neues Event</h2>
        <form onSubmit={handleSubmit} className="event-modal-form">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titel" required />
          <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Ort" required />
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Beschreibung" />
          <div className="event-modal-actions">
            <button type="submit">Speichern</button>
            <button type="button" onClick={onClose}>Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Portal verhindert, dass Eltern-Styles das Modal „unter“ etwas schieben
  return createPortal(modal, document.body);
}
