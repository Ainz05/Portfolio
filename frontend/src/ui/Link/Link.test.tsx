import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Link } from './Link';

const NEW_TAB = "(s'ouvre dans un nouvel onglet)";

describe('Link', () => {
  it('renders an https link opening a new tab safely, with an accessible hint', () => {
    render(
      <Link href="https://github.com/florian/projet" newTabLabel={NEW_TAB}>
        Voir le code
      </Link>,
    );
    const link = screen.getByRole('link', { name: `Voir le code ${NEW_TAB}` });
    expect(link).toHaveAttribute('href', 'https://github.com/florian/projet');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not open a new tab without a hint to announce it', () => {
    render(<Link href="https://example.com">Site</Link>);
    const link = screen.getByRole('link', { name: 'Site' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it.each(['', '   '])('stays in the same tab for the blank label %j', (label) => {
    render(
      <Link href="https://example.com" newTabLabel={label}>
        Site
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Site' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('renders the normalized https form of the href', () => {
    render(<Link href="HTTPS://Example.com">Site</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/');
  });

  it('renders the normalized mailto form of the href', () => {
    render(<Link href="mailto:a%40example.com">Écrire</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:a@example.com');
  });

  it.each(['#contact', '/cv/florian.pdf'])(
    'renders the internal link %j without target or rel',
    (href) => {
      render(
        <Link href={href} newTabLabel={NEW_TAB}>
          Aller
        </Link>,
      );
      const link = screen.getByRole('link', { name: 'Aller' });
      expect(link).toHaveAttribute('href', href);
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    },
  );

  it.each([
    '//evil.example.com',
    '/\\evil.example.com',
    '/../secret',
    '/%2e%2e/secret',
    '/cv/file.pdf?x=1',
    '#1abc',
    '#a b',
    '/cv/fi le.pdf',
  ])('renders text only for the hostile internal link %j', (href) => {
    const { container } = render(<Link href={href}>Texte</Link>);
    expect(container.querySelector('a')).toBeNull();
    expect(container).toHaveTextContent('Texte');
  });

  it('never adds target or rel to a valid mailto link', () => {
    render(
      <Link href="mailto:a@example.com?subject=Salut" newTabLabel={NEW_TAB}>
        Écrire
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Écrire' });
    expect(link).toHaveAttribute('href', 'mailto:a@example.com?subject=Salut');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'http://example.com',
    '//evil.example.com',
    'mailto:a@example.com?bcc=evil@example.com',
    'mailto:a@example.com,evil@example.com',
    'https://user:pass@example.com',
    '[À COMPLÉTER : email]',
    '',
  ])('renders text only, without any anchor, for %j', (href) => {
    const { container } = render(
      <Link href={href} newTabLabel={NEW_TAB}>
        Texte
      </Link>,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(container).toHaveTextContent('Texte');
    expect(container).not.toHaveTextContent(NEW_TAB);
  });

  it('gives the text-only fallback a neutral style, without any variant class', () => {
    const { container } = render(
      <Link href="javascript:alert(1)" variant="primary">
        Texte
      </Link>,
    );
    const fallback = container.querySelector('span');
    expect(fallback?.className).toContain('plainText');
    expect(fallback?.className).not.toMatch(/link|primary|secondary|accent|text_/);
  });

  it('applies the requested variant', () => {
    render(
      <Link href="https://example.com" variant="primary">
        Me contacter
      </Link>,
    );
    expect(screen.getByRole('link').className).toContain('primary');
  });

  it('gives the default text variant its own class', () => {
    render(<Link href="https://example.com">Site</Link>);
    expect(screen.getByRole('link').className).toContain('text');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Link href="https://example.com" newTabLabel={NEW_TAB}>
          Voir la démo
        </Link>
        <Link href="mailto:a@example.com" variant="accent">
          Écrire
        </Link>
        <Link href="javascript:alert(1)">Texte seul</Link>
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
