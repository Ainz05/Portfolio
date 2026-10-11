import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Link } from './Link';

const NEW_TAB = "(s'ouvre dans un nouvel onglet)";

describe('Link context', () => {
  it('appends the context to the accessible name, before the new tab hint', () => {
    render(
      <Link href="https://example.com" newTabLabel={NEW_TAB} context="EventHub">
        Voir le code
      </Link>,
    );
    expect(
      screen.getByRole('link', { name: `Voir le code, EventHub ${NEW_TAB}` }),
    ).toBeInTheDocument();
  });

  it('adds the context to an internal link too', () => {
    render(
      <Link href="#contact" context="EventHub">
        Voir
      </Link>,
    );
    expect(screen.getByRole('link', { name: 'Voir, EventHub' })).toBeInTheDocument();
  });

  it.each(['', '   '])('ignores the blank context %j', (context) => {
    render(
      <Link href="https://example.com" context={context}>
        Voir le code
      </Link>,
    );
    expect(screen.getByRole('link', { name: 'Voir le code' })).toBeInTheDocument();
  });

  it('does not show the context in the text-only fallback', () => {
    const { container } = render(
      <Link href="javascript:alert(1)" context="EventHub">
        Voir le code
      </Link>,
    );
    expect(container).toHaveTextContent(/^Voir le code$/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Link href="https://example.com" newTabLabel={NEW_TAB} context="EventHub">
          Voir le code
        </Link>
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
