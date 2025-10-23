// src/components/EventModal.js
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./eventModal.css";
import MapWithSearch from "./MapWithSearch";
import { auth, db, storage } from "../firebase";
import {
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { CATEGORY_OPTIONS } from "../constants/categories";

/* -------------------- Helpers -------------------- */
function toInputDate(v) {
  if (!v) return "";
  const d = v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
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

// Große Bilder vor Upload verkleinern (macht Upload schneller)
async function compressImage(file, maxW = 1600, maxH = 1200, quality = 0.8) {
  try {
    if (!file?.type?.startsWith("image/")) return file;
    const img = await new Promise((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = URL.createObjectURL(file);
    });

    let { width, height } = img;
    const scale = Math.min(1, maxW / width, maxH / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    const mime = file.type.includes("png") ? "image/png" : "image/jpeg";
    const blob = await new Promise((res) => canvas.toBlob(res, mime, quality));
    return blob ? new File([blob], file.name, { type: blob.type }) : file;
  } catch {
    return file; // Fallback
  }
}

/* -------------------- Component -------------------- */
export default function EventModal({ onClose, onEventAdded, initialEvent }) {
  const isEdit = Boolean(initialEvent?.id);

  // Form-States
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState({ address: "", lat: null, lon: null });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("./logo192.png");
  const [categories, setCategories] = useState([]);

  // Upload-States
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("./logo192.png");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100

  // Vorbefüllen beim Editieren
  useEffect(() => {
    if (!initialEvent) {
      setPreviewUrl("./logo192.png");
      setImageUrl("./logo192.png");
      setCategories([]);
      return;
    }
    setTitle(initialEvent.title || "");
    setLocation(
      typeof initialEvent.location === "string"
        ? { address: initialEvent.location, lat: null, lon: null }
        : initialEvent.location || { address: "", lat: null, lon: null }
    );
    setDescription(initialEvent.description || "");
    setCategories(Array.isArray(initialEvent?.categories) ? initialEvent.categories : []);

    const url = initialEvent.imageUrl || "./logo192.png";
    setImageUrl(url);
    setPreviewUrl(url);

    setStartDate(toInputDate(initialEvent.startDate));
    setEndDate(toInputDate(initialEvent.endDate));
  }, [initialEvent]);

  /* ---------- Drag & Drop / File Select ---------- */
  function acceptImage(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Bitte ein Bild auswählen (JPG, PNG, WEBP …).");
      return;
    }
    if (f.size > 10_000_000) {
      alert("Bitte ein kleineres Bild wählen (max. 10 MB).");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  const onFileChange = (e) => acceptImage(e.target.files?.[0]);
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    acceptImage(e.dataTransfer.files?.[0]);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  /* -------------------- Save -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("Bitte zuerst einloggen.");
    if (!startDate || !endDate) return alert("Bitte Start- und Enddatum angeben.");
    if (new Date(endDate) < new Date(startDate))
      return alert("Ende darf nicht vor dem Beginn liegen.");

    // Bild ggf. komprimieren & mit Fortschritt hochladen
    let finalImageUrl = imageUrl;
    try {
      if (file) {
        setUploading(true);
        setProgress(0);

        const fileToSend = file.size > 1_500_000 ? await compressImage(file) : file;

        const baseName = initialEvent?.id || Date.now().toString();
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `events/${user.uid}/${baseName}-${safeName}`;
        const storageRef = ref(storage, path);

        const uploadTask = uploadBytesResumable(storageRef, fileToSend, {
          cacheControl: "public, max-age=31536000",
          contentType: fileToSend.type || "image/jpeg",
        });

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snap) => {
              const pct = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100
              );
              setProgress(pct);
            },
            (err) => {
              console.error("Upload-Fehler:", err.code, err.message);
              reject(err);
            },
            async () => {
              finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });

        setUploading(false);
        setImageUrl(finalImageUrl);
      }
    } catch (err) {
      setUploading(false);
      console.error("Bild-Upload fehlgeschlagen:", err);
      alert("Bild-Upload fehlgeschlagen.");
      return;
    }

    const payload = {
      title,
      location: typeof location === "object" ? location : { address: location || "" },
      startDate: toTimestampOrNull(startDate),
      endDate: toTimestampOrNull(endDate),
      description,
      imageUrl: finalImageUrl,
      userId: user.uid,
      categories: categories, // Mehrfachkategorien
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
      onEventAdded?.();
      onClose?.();
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      alert("Beim Speichern ist ein Fehler aufgetreten.");
    }
  };

  /* -------------------- Delete -------------------- */
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

  /* -------------------- Render -------------------- */
  const modal = (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "Event bearbeiten" : "Neues Event"}</h2>

        <div className="event-layout">
          <form id="event-form" onSubmit={handleSubmit} className="event-modal-form">
            {/* Linke Spalte */}
            <section className="event-left">
              {/* Dropzone / Vorschaubild */}
              <label
                className={`dropzone ${dragOver ? "dragover" : ""}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Vorschau" className="preview" />
                ) : (
                  <span>Bild hierher ziehen oder klicken</span>
                )}
                <input type="file" accept="image/*" onChange={onFileChange} />
                <div className="hint">
                  {file
                    ? `Ausgewählt: ${file.name}`
                    : "JPG/PNG, max. 10 MB. Große Bilder werden automatisch verkleinert."}
                </div>
              </label>

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

            {/* Rechte Spalte */}
            <section className="event-right">
              <div className="location">
                <MapWithSearch location={location} setLocation={setLocation} />
              </div>

            {/* ▼ Mehrfach-Kategorien ▼ */}
            <div className="category-group">
              <label className="category-label">Kategorien</label>

              <div className="category-list">
                {CATEGORY_OPTIONS
                  .filter(o => !["today", "weekend"].includes(o.key)) // nur echte Kategorien
                  .map(opt => {
                    const checked = categories.includes(opt.key);
                    return (
                      <label
                        key={opt.key}
                        className={`chip ${checked ? "is-checked" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setCategories(prev =>
                              e.target.checked
                                ? [...new Set([...prev, opt.key])]
                                : prev.filter(k => k !== opt.key)
                            );
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
              </div>
              </div>

            </section>
          </form>

          <div className="event-modal-actions">
            <button
              type="submit"
              form="event-form"
              className="btn btn-primary"
              disabled={uploading}
            >
              {uploading ? `Lädt… ${progress}%` : isEdit ? "Änderungen speichern" : "Speichern"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Abbrechen
            </button>
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Löschen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}


