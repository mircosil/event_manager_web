// MapWithSearch.jsx
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Standard Marker Icons von Leaflet fixen:
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Standardicon überschreiben:
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center, map]);
  return null;
}

export default function MapWithSearch({ location, setLocation }) {
  const [coords, setCoords] = useState({ lat: 52.52, lng: 13.405 }); // Start: Berlin

  // Debounce-Suche – überschreibt NICHT mehr das Eingabefeld
  useEffect(() => {
    if (!location?.trim()) return;

    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
          { signal: controller.signal, headers: { "Accept-Language": "de" } }
        );
        const data = await res.json();
        if (data?.[0]) {
          const { lat, lon } = data[0];
          setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
          // WICHTIG: KEIN setLocation(display_name);  <-- nicht mehr die Eingabe ersetzen
        }
      } catch (_) {}
    }, 800); // >= 800ms = freundlich zu Nominatim (<= 1 req/s)

    return () => { clearTimeout(id); controller.abort(); };
  }, [location]);

  return (
    <div className="event-right">
      <div className="event-map">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={14}
          style={{ width: "100%", height: "300px", borderRadius: 8 }}
        >
          <TileLayer
            attribution='© OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lng]} />
          <ChangeView center={[coords.lat, coords.lng]} />
        </MapContainer>
      </div>

      {/* Eingabe: kontrolliert vom Eltern-State, wird NICHT mehr überschrieben */}
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Ort suchen…"
        required
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", marginTop: 10 }}
      />
    </div>
  );
}

