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
    render(<Hero content={CONTENT} imageUrls={{}} />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Salut, moi c’est Florian.');
    expect(screen.getByRole('region', { name: 'Salut, moi c’est Florian.' })).toBeInTheDocument();
  });

  it('highlights the first name only, without altering the text', () => {
    render(<Hero content={CONTENT} imageUrls={{}} />);
    const highlight = screen.getByText('Florian');
    expect(highlight.tagName).toBe('SPAN');
    expect(highlight.className).toContain('highlight');
    expect(highlight.parentElement).toBe(screen.getByRole('heading', { level: 1 }));
  });

  it('links the primary action to the contact anchor', () => {
    render(<Hero content={CONTENT} imageUrls={{}} />);
    expect(screen.getByRole('link', { name: 'Me contacter' })).toHaveAttribute('href', '#contact');
  });

  it('renders the placeholder CV action as plain text, without link', () => {
    render(<Hero content={CONTENT} imageUrls={{}} />);
    expect(screen.getByText('Télécharger mon CV')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Télécharger mon CV' })).toBeNull();
  });

  it('exposes the photo placeholder with an accessible name', () => {
    render(<Hero content={CONTENT} imageUrls={{}} />);
    expect(screen.getByRole('img', { name: '[Ta photo ici]' })).toBeInTheDocument();
  });

  it('shows the real photo, loaded right away, when the file is known', () => {
    const photo = { file: 'photo.webp', alt: 'Portrait de Florian', width: 800, height: 800 };
    render(
      <Hero content={{ ...CONTENT, photo }} imageUrls={{ 'photo.webp': '/assets/photo-1.webp' }} />,
    );
    const img = screen.getByRole('img', { name: 'Portrait de Florian' });
    expect(img).toHaveAttribute('src', '/assets/photo-1.webp');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(screen.queryByText('[Ta photo ici]')).toBeNull();
  });

  it('keeps the placeholder when the declared file is unknown', () => {
    const photo = { file: 'absent.webp', alt: 'Portrait', width: 800, height: 800 };
    render(<Hero content={{ ...CONTENT, photo }} imageUrls={{}} />);
    expect(screen.getByRole('img', { name: '[Ta photo ici]' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Hero content={CONTENT} imageUrls={{}} />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
