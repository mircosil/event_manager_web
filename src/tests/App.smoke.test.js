import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ---- Firebase mock: ALLES in der Factory definieren ----
jest.mock('../firebase', () => {
  const mockGetDocs = jest.fn().mockResolvedValue({ docs: [] });

  return {
    // re-exportierte Instanzen (Stub)
    auth: {},
    db: {},
    storage: {},

    // Auth
    onAuthStateChanged: jest.fn((_auth, cb) => { cb(null); return () => {}; }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    setPersistence: jest.fn(),
    browserLocalPersistence: {},
    signOut: jest.fn(),

    // Firestore
    collection: jest.fn(() => ({})),
    query: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    getDocs: mockGetDocs,          // <— Mock in der Factory
    doc: jest.fn(() => ({})),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(),
  };
});

// Leaflet / React-Leaflet mocken
jest.mock('leaflet', () => {
  const Icon = function (options = {}) { this.options = options; return this; };
  return {
    __esModule: true,
    default: {
      Icon,
      icon: (opts = {}) => ({ options: opts }),
      map: () => ({ setView: () => {}, addLayer: () => {} }),
      tileLayer: () => ({ addTo: () => {} }),
      marker: () => ({ addTo: () => {}, bindPopup: () => ({ openPopup: () => {} }) }),
    },
  };
});
jest.mock('leaflet/dist/leaflet.css', () => ({}));
jest.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children, ...props }) => <div data-testid="map" {...props}>{children}</div>,
    TileLayer: () => null,
    Marker: () => null,
    Popup: ({ children }) => <div>{children}</div>,
    useMap: () => ({}),
  };
});

// Wichtig: erst NACH den Mocks importieren
import App from '../App';

// Zugriff auf den innerhalb der Factory erzeugten Mock
const firebase = require('../firebase'); // CJS-Require liest die gemockte Version

test('App rendert ohne Crash', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  // asynchrone useEffect-Updates abwarten (verhindert act()-Warnung)
  await waitFor(() => expect(firebase.getDocs).toHaveBeenCalled());
});







