import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';

const NEW_TAB = "(s'ouvre dans un nouvel onglet)";

const PROJECT: Project = {
  id: 'demo',
  title: 'Mon projet',
  label: 'Projet perso · Test',
  description: 'Une description.',
  tags: ['React', 'Vite'],
  links: [
    { label: 'Voir le code', href: 'https://example.com/code' },
    { label: 'Voir la démo', href: '[À COMPLÉTER : URL de la démo]' },
  ],
  screenshotPlaceholder: "[Capture d'écran du projet]",
};

describe('ProjectCard', () => {
  it('is an article with a level-three title, a label and a description', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} />);
    const article = screen.getByRole('article');
    expect(within(article).getByRole('heading', { level: 3, name: 'Mon projet' })).toBeVisible();
    expect(article).toHaveTextContent('Projet perso · Test');
    expect(article).toHaveTextContent('Une description.');
  });

  it('lists the technologies', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} />);
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getByText('React').closest('li')).not.toBeNull();
    expect(screen.getByText('Vite').closest('li')).not.toBeNull();
  });

  it('opens a real https link in a new tab safely, with an accessible hint', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} />);
    const link = screen.getByRole('link', { name: `Voir le code ${NEW_TAB}` });
    expect(link).toHaveAttribute('href', 'https://example.com/code');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a placeholder link as plain text', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} />);
    expect(screen.getByText('Voir la démo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Voir la démo/ })).toBeNull();
  });

  it('shows the screenshot placeholder with an accessible name', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} />);
    expect(screen.getByRole('img', { name: "[Capture d'écran du projet]" })).toBeInTheDocument();
  });

  it('applies the mirrored layout class only when requested', () => {
    const { rerender } = render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} />);
    expect(screen.getByRole('article').className).not.toContain('mirrored');
    rerender(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} mirrored />);
    expect(screen.getByRole('article').className).toContain('mirrored');
  });

  it('renders text only for a hostile link', () => {
    const hostile = { ...PROJECT, links: [{ label: 'Piège', href: 'javascript:alert(1)' }] };
    render(<ProjectCard project={hostile} newTabLabel={NEW_TAB} />);
    expect(screen.getByText('Piège')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <ProjectCard project={PROJECT} newTabLabel={NEW_TAB} mirrored />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
