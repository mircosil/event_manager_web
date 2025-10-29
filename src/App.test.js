// src/App.test.jsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('App rendert ohne Crash', () => {
  expect(() =>
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
  ).not.toThrow();
});
