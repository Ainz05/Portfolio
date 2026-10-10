import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Tag } from './Tag';

describe('Tag', () => {
  it('renders its text as a non-interactive element', () => {
    const { container } = render(<Tag>Docker</Tag>);
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(container.querySelector('a, button, [tabindex], [role]')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <p>
          <Tag>Projet scolaire · DevOps</Tag>
        </p>
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
