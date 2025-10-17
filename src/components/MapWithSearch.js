// src/components/MapWithSearch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; 
import "./MapWithSearch.css"; 

// Minimaler Marker (optional eigenes Icon)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 0.6 });
  }, [center, map]);
  return null;
}

export default function MapWithSearch({ location, setLocation }) {
  // location: { address?: string, lat?: number, lon?: number } ODER string
  const parsed = useMemo(() => {
    if (typeof location === "string") return { address: location };
    return location || {};
  }, [location]);

  const [query, setQuery] = useState(parsed.address || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const abortRef = useRef(null);

  // Karte/Marker-Position
  const center = useMemo(() => {
    if (parsed.lat && parsed.lon) return [parsed.lat, parsed.lon];
    // Default: Berlin Mitte
    return [52.520008, 13.404954];
  }, [parsed.lat, parsed.lon]);

  // Debounce-Suche (Nominatim)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "8");
        url.searchParams.set("accept-language", "de");

        const res = await fetch(url, {
          signal: abortRef.current.signal,
          headers: {
            // Nominatim verlangt eine identifizierbare User-Agent/Referer
            "Accept": "application/json",
          },
        });
        if (!res.ok) throw new Error("Geocoding failed");
        const data = await res.json();

        setResults(
          data.map((r) => ({
            id: r.place_id,
            display: r.display_name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
          }))
        );
        setOpen(true);
        setHighlight(-1);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Geocode error:", e);
        }
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  const choose = (item) => {
    setOpen(false);
    setQuery(item.display);
    setResults([]);
    setLocation?.({ address: item.display, lat: item.lat, lon: item.lon });
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0) choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="map-with-search">
      <MapContainer
        center={center}
        zoom={parsed.lat ? 14 : 12}
        style={{ width: "100%", height: 260, borderRadius: 8 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap-Mitwirkende'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parsed.lat && parsed.lon && (
          <Marker position={[parsed.lat, parsed.lon]} icon={markerIcon} />
        )}
        <FlyTo center={parsed.lat && parsed.lon ? [parsed.lat, parsed.lon] : null} />
      </MapContainer>

      <div className="search-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Ort suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {open && results.length > 0 && (
          <ul className="search-dropdown">
            {results.map((item, idx) => (
              <li
                key={item.id}
                className={idx === highlight ? "active" : ""}
                onMouseDown={() => choose(item)}  // mousedown, damit Input nicht blur't
                onMouseEnter={() => setHighlight(idx)}
              >
                {item.display}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
