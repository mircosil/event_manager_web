module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleFileExtensions: ['js', 'jsx', 'json'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    // Falls ESM-Pakete Ärger machen (z. B. react-leaflet), ent-ignoriere sie:
    transformIgnorePatterns: [
      'node_modules/(?!react-leaflet|@react-leaflet/.*)'
    ],
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
    },
  };
  