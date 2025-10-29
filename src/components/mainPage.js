import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db, collection, getDocs, orderBy, query } from "../firebase";
import EventDetails from "./EventDetails";
import "./loginPage.css";

export default function MainPage() {
  const [events, setEvents] = useState([]);
  const [detailsEvent, setDetailsEvent] = useState(null);

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const q = (searchParams.get("q") || "").toLowerCase();
  const locQ = (searchParams.get("loc") || "").toLowerCase();

  const fetchEvents = async () => {
    const qy = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);

    const items = snap.docs.map((docu) => {
      const data = docu.data();
      const loc =
        typeof data.location === "string"
          ? { address: data.location, lat: null, lon: null }
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

  // ---- Helpers ----
  const toDate = (tsOrDate) =>
    tsOrDate?.seconds
      ? new Date(tsOrDate.seconds * 1000)
      : tsOrDate
      ? new Date(tsOrDate)
      : null;

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
    const day = now.getDay();
    const diffToSat = (6 - day + 7) % 7;
    const sat = new Date(now); sat.setHours(0, 0, 0, 0); sat.setDate(now.getDate() + diffToSat);
    const sun = new Date(sat); sun.setHours(23, 59, 59, 999); sun.setDate(sat.getDate() + 1);
    return occursInRange(ev, sat, sun);
  };

  const hasCategory = (e, key) =>
    Array.isArray(e.categories) && e.categories.includes(key);

  const matchesQuery = (e) =>
    !q || (e.title || "").toLowerCase().includes(q);

  const matchesLocation = (e) => {
    if (!locQ) return true;
    const addr =
      typeof e.location === "string"
        ? e.location
        : e.location?.address || "";
    return addr.toLowerCase().includes(locQ);
  };

  // ---- Finale Filterkette ----
  const filtered = events
    .filter((e) => {
      if (activeTab === "all") return true;
      if (activeTab === "today") return isToday(e);
      if (activeTab === "weekend") return isThisWeekend(e);
      return hasCategory(e, activeTab);
    })
    .filter(matchesQuery)
    .filter(matchesLocation);

  return (
    <main style={{ padding: 20 }}>
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
                  {e.description && <p className="card-text">{e.description}</p>}

                  {e.location && (
                    <p className="card-text">
                      <strong>Ort:</strong>{" "}
                      {typeof e.location === "string"
                        ? e.location
                        : e.location?.address || ""}
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



