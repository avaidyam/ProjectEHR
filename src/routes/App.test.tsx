import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('something truthy and falsy', () => {
  it('true to be true', () => {
    expect(true).toBe(true);
  });
  it('false to be false', () => {
    expect(false).toBe(false);
  });
});

import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from 'components/contexts/AuthContext';

describe('App', () => {
  it('renders stuff', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  });
});
