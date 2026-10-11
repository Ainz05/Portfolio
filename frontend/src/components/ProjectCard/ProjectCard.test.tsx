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
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />);
    const article = screen.getByRole('article');
    expect(within(article).getByRole('heading', { level: 3, name: 'Mon projet' })).toBeVisible();
    expect(article).toHaveTextContent('Projet perso · Test');
    expect(article).toHaveTextContent('Une description.');
  });

  it('lists the technologies', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />);
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getByText('React').closest('li')).not.toBeNull();
    expect(screen.getByText('Vite').closest('li')).not.toBeNull();
  });

  it('opens a real https link in a new tab safely, with an accessible hint', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />);
    const link = screen.getByRole('link', { name: `Voir le code, Mon projet ${NEW_TAB}` });
    expect(link).toHaveAttribute('href', 'https://example.com/code');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a placeholder link as plain text', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />);
    expect(screen.getByText('Voir la démo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Voir la démo/ })).toBeNull();
  });

  it('shows the screenshot placeholder with an accessible name', () => {
    render(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />);
    expect(screen.getByRole('img', { name: "[Capture d'écran du projet]" })).toBeInTheDocument();
  });

  it('applies the mirrored layout class only when requested', () => {
    const { rerender } = render(
      <ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />,
    );
    expect(screen.getByRole('article').className).not.toContain('mirrored');
    rerender(<ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} mirrored />);
    expect(screen.getByRole('article').className).toContain('mirrored');
  });

  it('renders text only for a hostile link', () => {
    const hostile = { ...PROJECT, links: [{ label: 'Piège', href: 'javascript:alert(1)' }] };
    render(<ProjectCard project={hostile} newTabLabel={NEW_TAB} imageUrls={{}} />);
    expect(screen.getByText('Piège')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('gives the same link label a distinct accessible name per project', () => {
    const other = { ...PROJECT, id: 'other', title: 'Autre projet' };
    render(
      <>
        <ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} />
        <ProjectCard project={other} newTabLabel={NEW_TAB} imageUrls={{}} />
      </>,
    );
    expect(
      screen.getByRole('link', { name: `Voir le code, Mon projet ${NEW_TAB}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: `Voir le code, Autre projet ${NEW_TAB}` }),
    ).toBeInTheDocument();
  });

  it('shows the real screenshot, lazily loaded, when the file is known', () => {
    const screenshot = { file: 'capture.png', alt: 'Page du projet', width: 1600, height: 1000 };
    render(
      <ProjectCard
        project={{ ...PROJECT, screenshot }}
        newTabLabel={NEW_TAB}
        imageUrls={{ 'capture.png': '/assets/capture-1.png' }}
      />,
    );
    const img = screen.getByRole('img', { name: 'Page du projet' });
    expect(img).toHaveAttribute('src', '/assets/capture-1.png');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <ProjectCard project={PROJECT} newTabLabel={NEW_TAB} imageUrls={{}} mirrored />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
