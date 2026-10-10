import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Container } from './Container';

describe('Container', () => {
  it('renders its children', () => {
    render(<Container>Contenu</Container>);
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Container>
          <p>Contenu</p>
        </Container>
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
