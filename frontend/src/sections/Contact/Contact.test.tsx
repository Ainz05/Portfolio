import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { ContactContent } from '@/types/sections';
import { Contact } from './Contact';

const NEW_TAB = "(s'ouvre dans un nouvel onglet)";
const SUBJECT = 'Stage DevOps / IA / MLOps — prise de contact';
const EMAIL_PLACEHOLDER = '[À COMPLÉTER : adresse email publique]';

const CONTENT: ContactContent = {
  id: 'contact',
  title: 'On discute ?',
  text: 'Un texte.',
  emailLabel: 'contact@example.com',
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/example' },
    { label: 'GitHub', href: '[À COMPLÉTER : URL GitHub]' },
  ],
  footer: '© 2026 Florian Test',
};

function renderContact(email: string, content: ContactContent = CONTENT) {
  return render(
    <Contact content={content} email={email} subject={SUBJECT} newTabLabel={NEW_TAB} />,
  );
}

describe('Contact', () => {
  it('is a region named by its level-two heading, with the anchor id', () => {
    renderContact('contact@example.com');
    const region = screen.getByRole('region', { name: 'On discute ?' });
    expect(region).toHaveAttribute('id', 'contact');
    expect(within(region).getByRole('heading', { level: 2 })).toBeVisible();
    expect(region).toHaveTextContent('Un texte.');
  });

  it('links a valid address with an encoded mailto carrying the subject, in the same tab', () => {
    renderContact('contact@example.com');
    const link = screen.getByRole('link', { name: 'contact@example.com' });
    expect(link).toHaveAttribute(
      'href',
      `mailto:contact@example.com?subject=${encodeURIComponent(SUBJECT)}`,
    );
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('shows the email placeholder as plain text, without any mailto', () => {
    const content = { ...CONTENT, emailLabel: EMAIL_PLACEHOLDER };
    const { container } = renderContact(EMAIL_PLACEHOLDER, content);
    expect(screen.getByText(EMAIL_PLACEHOLDER)).toBeVisible();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('opens a real social link in a new tab safely, with an accessible hint', () => {
    renderContact('contact@example.com');
    const link = screen.getByRole('link', { name: `LinkedIn ${NEW_TAB}` });
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a placeholder social link as plain text', () => {
    renderContact('contact@example.com');
    expect(screen.getByText('GitHub')).toBeVisible();
    expect(screen.queryByRole('link', { name: /GitHub/ })).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Contact
          content={CONTENT}
          email="contact@example.com"
          subject={SUBJECT}
          newTabLabel={NEW_TAB}
        />
      </main>,
    );
    const { violations } = await axe(container);
    expect(violations).toEqual([]);
  });
});
