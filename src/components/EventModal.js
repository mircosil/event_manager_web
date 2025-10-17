// src/components/EventModal.js
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./eventModal.css";
import MapWithSearch from "./MapWithSearch";
import { auth, db } from "../firebase";
import { Timestamp, addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp, } from "firebase/firestore";


function toInputDate(v) {
  if (!v) return "";
  const d = v.seconds ? new Date(v.seconds * 1000) : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


function toTimestampOrNull(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
}

export default function EventModal({ onClose, onEventAdded, initialEvent }) {
  const isEdit = Boolean(initialEvent?.id);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("./logo192.png");


  useEffect(() => {
    if (!initialEvent) return;
    setTitle(initialEvent.title || "");
    setLocation(
      typeof initialEvent.location === "string"
        ? { address: initialEvent.location }     // alte Einträge
        : (initialEvent.location || { address: "", lat: null, lon: null })
    );
    setDescription(initialEvent.description || "");
    setImageUrl(initialEvent.imageUrl || "./logo192.png");
    setStartDate(toInputDate(initialEvent.startDate));
    setEndDate(toInputDate(initialEvent.endDate));
  }, [initialEvent]);


  // Speichern (Add oder Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("Bitte zuerst einloggen.");
    if (!startDate || !endDate)
      return alert("Bitte Start- und Enddatum angeben.");
    if (new Date(endDate) < new Date(startDate))
      return alert("Ende darf nicht vor dem Beginn liegen.");

    const payload = {
      title,
      location: location && typeof location === "object"
      ? location
      : { address: location || "" },
      startDate: toTimestampOrNull(startDate),
      endDate: toTimestampOrNull(endDate),
      description,
      imageUrl,
      userId: user.uid,
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "events", initialEvent.id), payload);
      } else {
        await addDoc(collection(db, "events"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      onEventAdded?.(); // Liste neu laden
      onClose?.();
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      alert("Beim Speichern ist ein Fehler aufgetreten.");
    }
  };

  // Löschen (nur im Edit-Modus sichtbar)
  const handleDelete = async () => {
    if (!initialEvent?.id) return;
    if (!window.confirm("Dieses Event wirklich löschen?")) return;
    try {
      await deleteDoc(doc(db, "events", initialEvent.id));
      onEventAdded?.();
      onClose?.();
    } catch (err) {
      console.error("Löschen fehlgeschlagen:", err);
      alert("Beim Löschen ist ein Fehler aufgetreten.");
    }
  };

  const modal = (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "Event bearbeiten" : "Neues Event"}</h2>

        <div className="event-layout">
          <form id="event-form" onSubmit={handleSubmit} className="event-modal-form">
            <section className="event-left">
              <img src={imageUrl || "./logo192.png"} alt="Event" className="event-modal-image" />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel"
                required
              />
              <div className="date-range">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Beginn"
                  required
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  placeholder="Ende"
                  required
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung"
              />
            </section>
            <section className="event-right">
              <div className="location">
                <MapWithSearch location={location} setLocation={setLocation} />
              </div>
            </section>         
          </form>

          <div className="event-modal-actions">
            <button type="submit" form="event-form" className="btn btn-primary">
              {isEdit ? "Änderungen speichern" : "Speichern"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete}>Löschen</button>
            )}
          </div> 

        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
