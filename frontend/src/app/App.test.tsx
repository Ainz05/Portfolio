import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import App from './App';

describe('App', () => {
  it('renders a single level-one heading', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('uses each id attribute only once', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<App />);
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
