import React, { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./eventModal.css";   
import "./eventDetails.css";  

// Leaflet Marker-Icon sauber setzen (funktioniert in CRA/Vite/Webpack)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map sanft auf neue Koordinaten zentrieren
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export default function EventDetails({ event, onClose }) {
  // ⚠️ Hooks müssen vor jedem early return stehen
  // Wir arbeiten erstmal mit einem "sicheren" Event-Objekt
  const safeEvent = event ?? {};

  // Adresse robust ableiten (String + Objekt)
  const address =
    typeof safeEvent.location === "string"
      ? safeEvent.location
      : safeEvent.location?.address || "";

  // Koordinaten aus dem Event lesen (falls vorhanden)
  const initialCoords = useMemo(() => {
    const loc = safeEvent.location && typeof safeEvent.location === "object"
      ? safeEvent.location
      : null;
    const lat = Number(loc?.lat);
    const lon = Number(loc?.lon);
    return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : null;
  }, [safeEvent.location]);

  // Zustand für die tatsächlich anzuzeigenden Koordinaten
  const [coords, setCoords] = useState(initialCoords);
  const [geocoding, setGeocoding] = useState(false);

  // Falls keine Koordinaten vorhanden, einmalig per Nominatim aus der Adresse ermitteln
  useEffect(() => {
    let cancelled = false;

    async function geocodeOnce(q) {
      try {
        setGeocoding(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}`;
        const res = await fetch(url, { headers: { "Accept-Language": "de" } });
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const { lat, lon } = data[0];
          const parsed = [Number(lat), Number(lon)];
          if (Number.isFinite(parsed[0]) && Number.isFinite(parsed[1])) {
            setCoords(parsed);
          }
        }
      } catch {
        // still fine – Karte bleibt einfach aus
      } finally {
        if (!cancelled) setGeocoding(false);
      }
    }

    if (!coords && address) {
      geocodeOnce(address);
    }

    return () => {
      cancelled = true;
    };
  }, [coords, address]);

  // Datum
  const start = safeEvent.startDate?.seconds
    ? new Date(safeEvent.startDate.seconds * 1000)
    : null;
  const end = safeEvent.endDate?.seconds
    ? new Date(safeEvent.endDate.seconds * 1000)
    : null;

  // Kategorien
  const cats = Array.isArray(safeEvent.categories) ? safeEvent.categories : [];

  // ✅ Erst NACH den Hooks darf früh beendet werden
  if (!event) return null;

  const modal = (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>

        <div className="details-layout">
          {/* Linke Spalte: Bild & Text */}
          <section className="details-left">
            <img
              src={safeEvent.imageUrl || "./logo192.png"}
              alt="Event"
              className="details-image"
            />

            <div className="details-block">
              <h4 className="details-title">{safeEvent.title}</h4>
              {safeEvent.description && (
                <p className="details-paragraph">{safeEvent.description}</p>
              )}
            </div>

            <div className="details-block">
              <p className="details-paragraph">
                <strong>Ort:</strong> {address}
              </p>
              <p className="details-paragraph">
                <strong>Datum:</strong>{" "}
                {start ? start.toLocaleDateString() : "?"} –{" "}
                {end ? end.toLocaleDateString() : "?"}
              </p>
            </div>

            {!!cats.length && (
              <div className="details-block">
                <p className="details-paragraph">
                  <strong>Kategorien</strong>
                </p>
                <div className="details-chips">
                  {cats.map((c) => (
                    <span className="chip" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Rechte Spalte: Karte */}
          <section className="details-right">
            {coords ? (
              <MapContainer
                center={coords}
                zoom={14}
                scrollWheelZoom={false}
                className="details-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={coords} />
                <Marker position={coords} icon={defaultIcon}>
                  <Popup>
                    <div style={{ maxWidth: 200 }}>
                      <strong>{safeEvent.title}</strong>
                      <div style={{ fontSize: 12, marginTop: 4 }}>{address}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="details-map-placeholder">
                {geocoding ? "Lade Karte…" : "Keine Kartenposition vorhanden."}
              </div>
            )}
          </section>
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
