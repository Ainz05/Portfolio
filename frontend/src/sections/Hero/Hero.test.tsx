import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { HeroContent } from '@/types/sections';
import { Hero } from './Hero';

const CONTENT: HeroContent = {
  id: 'accueil',
  eyebrow: 'Bienvenue.',
  titleBefore: 'Salut, moi c’est ',
  titleHighlight: 'Florian',
  titleAfter: '.',
  paragraph: 'Un paragraphe.',
  primaryAction: { label: 'Me contacter', href: '#contact' },
  secondaryAction: { label: 'Télécharger mon CV', href: '[À COMPLÉTER : CV]' },
  photoPlaceholder: '[Ta photo ici]',
};

describe('Hero', () => {
  it('has a single level-one heading with the whole title, naming the section', () => {
    render(<Hero content={CONTENT} />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Salut, moi c’est Florian.');
    expect(screen.getByRole('region', { name: 'Salut, moi c’est Florian.' })).toBeInTheDocument();
  });

  it('highlights the first name only, without altering the text', () => {
    render(<Hero content={CONTENT} />);
    const highlight = screen.getByText('Florian');
    expect(highlight.tagName).toBe('SPAN');
    expect(highlight.className).toContain('highlight');
    expect(highlight.parentElement).toBe(screen.getByRole('heading', { level: 1 }));
  });

  it('links the primary action to the contact anchor', () => {
    render(<Hero content={CONTENT} />);
    expect(screen.getByRole('link', { name: 'Me contacter' })).toHaveAttribute('href', '#contact');
  });

  it('renders the placeholder CV action as plain text, without link', () => {
    render(<Hero content={CONTENT} />);
    expect(screen.getByText('Télécharger mon CV')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Télécharger mon CV' })).toBeNull();
  });

  it('exposes the photo placeholder with an accessible name', () => {
    render(<Hero content={CONTENT} />);
    expect(screen.getByRole('img', { name: '[Ta photo ici]' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Hero content={CONTENT} />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
