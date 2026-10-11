import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Header } from './Header';

const ITEMS = [
  { label: 'Projets', href: '#projets' },
  { label: 'Outils', href: '#outils' },
  { label: 'À propos', href: '#a-propos' },
  { label: 'Contact', href: '#contact' },
];

function renderHeader() {
  return render(
    <Header
      logo="Florian Test"
      navLabel="Navigation principale"
      skipLinkLabel="Aller au contenu"
      skipLinkHref="#contenu"
      items={ITEMS}
    />,
  );
}

describe('Header', () => {
  it('is a banner showing the logo text', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toHaveTextContent('Florian Test');
  });

  it('has a named navigation listing every item', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    expect(screen.getAllByRole('listitem')).toHaveLength(ITEMS.length);
    for (const item of ITEMS) {
      const link = screen.getByRole('link', { name: item.label });
      expect(nav).toContainElement(link);
      expect(link).toHaveAttribute('href', item.href);
    }
  });

  it('puts the skip link first in the tab order, pointing at the main content', async () => {
    renderHeader();
    const skipLink = screen.getByRole('link', { name: 'Aller au contenu' });
    expect(skipLink).toHaveAttribute('href', '#contenu');
    await userEvent.tab();
    expect(skipLink).toHaveFocus();
  });

  it('renders text only for an invalid navigation href', () => {
    render(
      <Header
        logo="F"
        navLabel="Nav"
        skipLinkLabel="Skip"
        skipLinkHref="#main"
        items={[{ label: 'Piège', href: 'javascript:alert(1)' }]}
      />,
    );
    expect(screen.getByText('Piège')).toBeInTheDocument();
    expect(within(screen.getByRole('navigation')).queryByRole('link')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderHeader();
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
