// src/components/EventModal.js
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { db, auth, collection, addDoc, serverTimestamp}  from "../firebase";
import "./eventModal.css";
import MapWithSearch from "./MapWithSearch";
import { Timestamp } from "firebase/firestore";


export default function EventModal({ onClose, onEventAdded }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const user = auth.currentUser;
    if (!user) return alert("Bitte zuerst einloggen.");
  
    // 🧩 Validierung
    if (!startDate || !endDate) {
      return alert("Bitte Start- und Enddatum angeben.");
    }
  
    if (new Date(endDate) < new Date(startDate)) {
      return alert("Ende darf nicht vor dem Beginn liegen.");
    }
  
    try {
      // ✅ Variante B – Speichern mit Firestore Timestamps
      await addDoc(collection(db, "events"), {
        title,
        location,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        description,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
  
      // 🧹 Formular zurücksetzen
      setTitle("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setDescription("");
  
      // 🔁 Callback & Schließen
      onEventAdded?.();
      onClose?.();
  
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Beim Speichern ist ein Fehler aufgetreten.");
    }
  };

  const modal = (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Neues Event</h2>

        <div className="event-layout">
          <form id="event-form" onSubmit={handleSubmit} className="event-modal-form">
            <section className="event-left">
              <img src="./logo192.png" alt="Event" className="event-modal-image" />
              <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titel" required />
              <div className="date-range">
                <input
                  type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} placeholder="Beginn" required />
                <input 
                  type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} min={startDate || undefined} placeholder="Ende" required />
              </div>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Beschreibung" />
            </section>

            <section className="event-right">
              <div className="location"> 
                <MapWithSearch location={location} setLocation={setLocation} />
              </div>
            </section>
            </form>
          </div>
          
          <div className="event-modal-actions">
            <button type="submit" form="event-form">Speichern</button>
            <button type="button" onClick={onClose}>Abbrechen</button>
          </div>
        
      </div>
    </div>
  );

  // Portal verhindert, dass Eltern-Styles das Modal „unter“ etwas schieben
  return createPortal(modal, document.body);
}
