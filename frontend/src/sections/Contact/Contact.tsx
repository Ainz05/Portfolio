import { buildMailto } from '@/lib/mailto';
import type { ContactContent } from '@/types/sections';
import { Heading } from '@/ui/Heading';
import { Link } from '@/ui/Link';
import { Section } from '@/ui/Section';
import styles from './Contact.module.css';

export interface ContactProps {
  readonly content: ContactContent;
  /** Public contact address, injected by app/ (from the site configuration). */
  readonly email: string;
  readonly subject: string;
  readonly newTabLabel: string;
}

export function Contact({ content, email, subject, newTabLabel }: ContactProps) {
  const titleId = `${content.id}-titre`;
  // Never built by hand: an invalid or placeholder address gives null, and an empty href makes
  // ui/Link show the label as plain text instead of a link.
  const emailHref = buildMailto({ to: email, subject }) ?? '';
  return (
    <Section id={content.id} titleId={titleId} tone="dark">
      <div className={styles.layout}>
        <Heading level={2} size={1} id={titleId}>
          {content.title}
        </Heading>
        <p className={styles.text}>{content.text}</p>
        <ul className={styles.actions}>
          <li>
            <Link href={emailHref} variant="accent" context={content.emailContext}>
              {content.emailLabel}
            </Link>
          </li>
          {content.socialLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} newTabLabel={newTabLabel}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
