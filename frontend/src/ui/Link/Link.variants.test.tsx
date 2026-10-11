import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Link } from './Link';
import type { LinkVariant } from './Link';

describe('Link variants', () => {
  it.each<LinkVariant>(['text', 'nav', 'primary', 'secondary', 'accent'])(
    'gives the %s variant its own class',
    (variant) => {
      render(
        <Link href="#contact" variant={variant}>
          Aller
        </Link>,
      );
      expect(screen.getByRole('link').className).toContain(variant);
    },
  );

  it('has no accessibility violations for the nav variant', async () => {
    const { container } = render(
      <nav aria-label="Principale">
        <Link href="#projets" variant="nav">
          Projets
        </Link>
      </nav>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
