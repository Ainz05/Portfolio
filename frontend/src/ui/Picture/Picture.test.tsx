import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { ImageSource } from '@/types/image';
import { Picture } from './Picture';

const IMAGE: ImageSource = {
  src: '/assets/photo-abc123.webp',
  alt: 'Portrait de Florian',
  width: 800,
  height: 600,
};

describe('Picture', () => {
  it('renders the image with its alternative text and dimensions, lazily by default', () => {
    render(<Picture image={IMAGE} placeholder="[Ta photo ici]" />);
    const img = screen.getByRole('img', { name: 'Portrait de Florian' });
    expect(img).toHaveAttribute('src', '/assets/photo-abc123.webp');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('fetchpriority', 'auto');
  });

  it('loads a priority image right away', () => {
    render(<Picture image={IMAGE} placeholder="[Ta photo ici]" priority />);
    const img = screen.getByRole('img', { name: 'Portrait de Florian' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('falls back to the placeholder without an image', () => {
    const { container } = render(<Picture image={null} placeholder="[Ta photo ici]" />);
    expect(screen.getByRole('img', { name: '[Ta photo ici]' })).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Picture image={IMAGE} placeholder="[Ta photo ici]" />
        <Picture image={null} placeholder="[Capture d'écran du projet]" />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
