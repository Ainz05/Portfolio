import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { AboutContent } from '@/types/sections';
import { About } from './About';

const CONTENT: AboutContent = {
  id: 'a-propos',
  title: 'Un peu plus sur moi',
  paragraphs: [
    'Premier paragraphe [À COMPLÉTER : école].',
    'Deuxième paragraphe.',
    'Troisième paragraphe.',
  ],
};

describe('About', () => {
  it('is a region named by its level-two heading, with the anchor id', () => {
    render(<About content={CONTENT} />);
    const region = screen.getByRole('region', { name: 'Un peu plus sur moi' });
    expect(region).toHaveAttribute('id', 'a-propos');
    expect(
      within(region).getByRole('heading', { level: 2, name: 'Un peu plus sur moi' }),
    ).toBeVisible();
  });

  it('shows the paragraphs in order', () => {
    render(<About content={CONTENT} />);
    const region = screen.getByRole('region');
    const paragraphs = Array.from(region.querySelectorAll('p'), (p) => p.textContent);
    expect(paragraphs).toEqual(CONTENT.paragraphs);
  });

  it('keeps the visible school placeholder', () => {
    render(<About content={CONTENT} />);
    expect(screen.getByText(/\[À COMPLÉTER : école\]/)).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <About content={CONTENT} />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
