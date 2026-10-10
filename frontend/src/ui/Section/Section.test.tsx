import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Heading } from '@/ui/Heading';
import { Section } from './Section';

function renderSection(tone?: 'light' | 'white' | 'dark') {
  return render(
    <Section id="projets" titleId="projets-titre" {...(tone ? { tone } : {})}>
      <Heading level={2} id="projets-titre">
        Mes projets
      </Heading>
    </Section>,
  );
}

describe('Section', () => {
  it('is a named region carrying the anchor id', () => {
    renderSection();
    const region = screen.getByRole('region', { name: 'Mes projets' });
    expect(region).toHaveAttribute('id', 'projets');
    expect(region).toHaveAttribute('aria-labelledby', 'projets-titre');
  });

  it.each(['light', 'white', 'dark'] as const)('applies the %s tone', (tone) => {
    renderSection(tone);
    expect(screen.getByRole('region').className).toContain(tone);
  });

  it('defaults to the light tone', () => {
    renderSection();
    expect(screen.getByRole('region').className).toContain('light');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Section id="a" titleId="a-titre" tone="white">
          <Heading level={2} id="a-titre">
            Titre
          </Heading>
        </Section>
        <Section id="b" titleId="b-titre" tone="dark">
          <Heading level={2} id="b-titre">
            Autre titre
          </Heading>
        </Section>
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
