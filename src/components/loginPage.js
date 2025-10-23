import React, { useState, useEffect } from "react";
import "./loginPage.css";
import EventModal from "./EventModal";
import { db, collection, getDocs, orderBy, query } from "../firebase";
import { useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Tab aus der URL lesen (?tab=sport)
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const items = snap.docs.map((docu) => {
      const data = docu.data();
      const loc =
        typeof data.location === "string"
          ? { address: data.location }
          : data.location || null;

      return {
        id: docu.id,
        ...data,
        location: loc,
        categories: Array.isArray(data.categories) ? data.categories : [],
      };
    });

    setEvents(items);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAdd = () => { setSelectedEvent(null); setShowModal(true); };
  const openEdit = (event) => { setSelectedEvent(event); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setSelectedEvent(null); };

  // --- Filter-Helpers ---
  const toDate = (tsOrDate) =>
    tsOrDate?.seconds ? new Date(tsOrDate.seconds * 1000) : (tsOrDate ? new Date(tsOrDate) : null);

  const occursInRange = (ev, start, end) => {
    const s = toDate(ev.startDate);
    const e = toDate(ev.endDate) || s;
    if (!s) return false;
    return e >= start && s <= end;
  };

  const isToday = (ev) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return occursInRange(ev, start, end);
  };

  const isThisWeekend = (ev) => {
    const now = new Date();
    const day = now.getDay(); // So=0 ... Sa=6
    const diffToSat = (6 - day + 7) % 7;
    const sat = new Date(now); sat.setHours(0,0,0,0); sat.setDate(now.getDate() + diffToSat);
    const sun = new Date(sat); sun.setHours(23,59,59,999); sun.setDate(sat.getDate() + 1);
    return occursInRange(ev, sat, sun);
  };

  const hasCategory = (e, key) =>
    Array.isArray(e.categories) && e.categories.includes(key);

  const filtered = events.filter((e) => {
    if (activeTab === "all")     return true;
    if (activeTab === "today")   return isToday(e);
    if (activeTab === "weekend") return isThisWeekend(e);
    return hasCategory(e, activeTab);
  });

  return (
    <main style={{ padding: 20 }}>
      {/* keine lokale Tabs-Leiste mehr – die obere (Header) steuert via ?tab=... */}

      <div className="add-event-container">
        <button className="add-button" onClick={openAdd}>
          <i className="bi bi-plus-square" /> Event hinzufügen
        </button>
      </div>

      <div className="event-card-container">
        {filtered.map((e) => (
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
                  {typeof e.location === "string" ? e.location : e.location?.address}
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


