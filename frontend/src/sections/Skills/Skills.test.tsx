import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { SkillsContent } from '@/types/skill';
import { Skills } from './Skills';

const CONTENT: SkillsContent = {
  id: 'outils',
  title: 'Avec quoi je travaille',
  columns: [
    { id: 'a', title: 'Alpha', description: 'Description alpha.' },
    { id: 'b', title: 'Bravo', description: 'Description bravo.' },
    { id: 'c', title: 'Charlie', description: 'Description charlie.' },
  ],
  closing: 'Une phrase de clôture.',
};

describe('Skills', () => {
  it('is a region named by its level-two heading, with the anchor id', () => {
    render(<Skills content={CONTENT} />);
    const region = screen.getByRole('region', { name: 'Avec quoi je travaille' });
    expect(region).toHaveAttribute('id', 'outils');
    expect(
      within(region).getByRole('heading', { level: 2, name: 'Avec quoi je travaille' }),
    ).toBeVisible();
  });

  it('lists the three columns with a level-three heading each, in order', () => {
    render(<Skills content={CONTENT} />);
    expect(screen.getByRole('list')).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
    ]);
  });

  it('shows the closing sentence', () => {
    render(<Skills content={CONTENT} />);
    expect(screen.getByText('Une phrase de clôture.')).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Skills content={CONTENT} />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
