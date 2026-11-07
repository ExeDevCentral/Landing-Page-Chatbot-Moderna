import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App routing', () => {
  it('renders the login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
