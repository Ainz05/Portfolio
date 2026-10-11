import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { ProjectsContent } from '@/types/project';
import { Projects } from './Projects';

const NEW_TAB = "(s'ouvre dans un nouvel onglet)";

function makeProject(id: string, title: string) {
  return {
    id,
    title,
    label: 'Projet perso · Test',
    description: `Description de ${title}.`,
    tags: ['React'],
    links: [{ label: 'Voir le code', href: 'https://example.com/code' }],
    screenshotPlaceholder: "[Capture d'écran du projet]",
  };
}

const CONTENT: ProjectsContent = {
  id: 'projets',
  title: 'Mes projets',
  subtitle: 'Un sous-titre.',
  projects: [makeProject('a', 'Alpha'), makeProject('b', 'Bravo'), makeProject('c', 'Charlie')],
};

describe('Projects', () => {
  it('is a region named by its level-two heading, with the anchor id', () => {
    render(<Projects content={CONTENT} newTabLabel={NEW_TAB} />);
    const region = screen.getByRole('region', { name: 'Mes projets' });
    expect(region).toHaveAttribute('id', 'projets');
    expect(within(region).getByRole('heading', { level: 2, name: 'Mes projets' })).toBeVisible();
    expect(region).toHaveTextContent('Un sous-titre.');
  });

  it('lists one article with a level-three heading per project, in order', () => {
    render(<Projects content={CONTENT} newTabLabel={NEW_TAB} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
    ]);
  });

  it('passes the new-tab label to the project links', () => {
    render(<Projects content={CONTENT} newTabLabel={NEW_TAB} />);
    expect(screen.getAllByRole('link', { name: `Voir le code ${NEW_TAB}` })).toHaveLength(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Projects content={CONTENT} newTabLabel={NEW_TAB} />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
