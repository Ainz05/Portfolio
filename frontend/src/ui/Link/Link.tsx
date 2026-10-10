import { isExternalHttpsUrl, sanitizeUrl } from '@/lib/url';
import styles from './Link.module.css';
import type { ReactNode } from 'react';

export type LinkVariant = 'text' | 'primary' | 'secondary' | 'accent';

export interface LinkProps {
  /** Raw URL (from data/ or buildMailto): always validated here, never used as is. */
  readonly href: string;
  readonly variant?: LinkVariant;
  /** Announced to assistive technologies when the link opens a new tab. Without it, no new tab. */
  readonly newTabLabel?: string;
  readonly children: ReactNode;
}

function classNames(variant: LinkVariant): string {
  return `${styles.link ?? ''} ${styles[variant] ?? ''}`;
}

export function Link({ href, variant = 'text', newTabLabel, children }: LinkProps) {
  const safeHref = sanitizeUrl(href);
  if (safeHref === null) {
    // An invalid URL must never produce an <a>: show the text only, styled as plain text so it
    // does not look clickable.
    return <span className={styles.plainText}>{children}</span>;
  }
  const opensNewTab = newTabLabel !== undefined && isExternalHttpsUrl(safeHref);
  return (
    <a
      href={safeHref}
      className={classNames(variant)}
      {...(opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {opensNewTab ? (
        <>
          {' '}
          <span className={styles.visuallyHidden}>{newTabLabel}</span>
        </>
      ) : null}
    </a>
  );
}
