import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the admin panel with the mock user', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /sistema de gestión empresarial/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Carlos Administrador')).toBeInTheDocument();
  });

  it('redirects the root route to the dashboard', async () => {
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
