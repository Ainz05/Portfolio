import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Footer } from './Footer';

describe('Footer', () => {
  it('is a contentinfo landmark showing the text', () => {
    render(<Footer text="© 2026 Florian Test" />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Florian Test');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <main>Contenu</main>
        <Footer text="© 2026 Florian Test" />
      </>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
