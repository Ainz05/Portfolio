import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Heading } from './Heading';

describe('Heading', () => {
  it.each([1, 2, 3, 4] as const)('renders a level %i heading', (level) => {
    render(<Heading level={level}>Titre</Heading>);
    expect(screen.getByRole('heading', { level, name: 'Titre' })).toBeInTheDocument();
  });

  it('decouples visual size from semantic level', () => {
    render(
      <Heading level={2} size={4}>
        Titre
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('size4');
    expect(heading.className).not.toContain('size2');
  });

  it('uses the level as default size and forwards the id', () => {
    render(
      <Heading level={3} id="projects-title">
        Titre
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.className).toContain('size3');
    expect(heading).toHaveAttribute('id', 'projects-title');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Heading level={1}>Titre</Heading>
        <Heading level={2} size={3}>
          Sous-titre
        </Heading>
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
