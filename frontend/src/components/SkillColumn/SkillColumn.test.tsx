import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SkillColumn } from './SkillColumn';

const COLUMN = { id: 'test', title: 'Mettre en ligne', description: 'Une description.' };

describe('SkillColumn', () => {
  it('shows a level-three title and its description', () => {
    render(<SkillColumn column={COLUMN} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Mettre en ligne' })).toBeVisible();
    expect(screen.getByText('Une description.')).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <SkillColumn column={COLUMN} />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
