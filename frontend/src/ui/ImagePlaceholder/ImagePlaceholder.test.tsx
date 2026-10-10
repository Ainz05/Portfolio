import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ImagePlaceholder } from './ImagePlaceholder';

const LABEL = '[À COMPLÉTER : capture d’écran du projet]';

describe('ImagePlaceholder', () => {
  it('exposes the label as the accessible name of an image', () => {
    render(<ImagePlaceholder label={LABEL} />);
    expect(screen.getByRole('img', { name: LABEL })).toBeInTheDocument();
  });

  it('shows the placeholder text visibly', () => {
    const { container } = render(<ImagePlaceholder label={LABEL} />);
    expect(container).toHaveTextContent(LABEL);
  });

  it('loads no external resource', () => {
    const { container } = render(<ImagePlaceholder label={LABEL} />);
    expect(container.querySelector('img, source, video, iframe, [src], [srcset]')).toBeNull();
  });

  it.each(['neutral', 'accent'] as const)('applies the %s tone', (tone) => {
    render(<ImagePlaceholder label={LABEL} tone={tone} />);
    expect(screen.getByRole('img').className).toContain(tone);
  });

  it('defaults to the neutral tone', () => {
    render(<ImagePlaceholder label={LABEL} />);
    expect(screen.getByRole('img').className).toContain('neutral');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <ImagePlaceholder label={LABEL} />
        <ImagePlaceholder label="[Ta photo ici]" tone="accent" />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
