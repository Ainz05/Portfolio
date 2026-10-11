import { sanitizeInternalHref } from '@/lib/internalHref';
import { isExternalHttpsUrl, sanitizeUrl } from '@/lib/url';
import styles from './Link.module.css';
import type { ReactNode } from 'react';

export type LinkVariant = 'text' | 'primary' | 'secondary' | 'accent';

export interface LinkProps {
  /**
   * Raw URL (https:, mailto:, #anchor or same-origin path): always validated here,
   * never used as is.
   */
  readonly href: string;
  readonly variant?: LinkVariant;
  /** Announced to assistive technologies when the link opens a new tab. Without it, no new tab. */
  readonly newTabLabel?: string;
  /**
   * Visually hidden text that tells identical labels apart for screen reader users
   * (e.g. the project title after "Voir le code"). Ignored when blank or when no link is rendered.
   */
  readonly context?: string;
  readonly children: ReactNode;
}

function classNames(variant: LinkVariant): string {
  return `${styles.link ?? ''} ${styles[variant] ?? ''}`;
}

interface HiddenSuffixProps {
  readonly context: string | undefined;
  readonly newTabLabel: string | undefined;
}

// Hidden parts of the accessible name: "label, context (new tab hint)". The comma gives a
// natural pause when read aloud.
function HiddenSuffix({ context, newTabLabel }: HiddenSuffixProps) {
  const hasContext = context !== undefined && context.trim() !== '';
  return (
    <>
      {hasContext ? <span className={styles.visuallyHidden}>, {context}</span> : null}
      {newTabLabel !== undefined ? (
        <>
          {' '}
          <span className={styles.visuallyHidden}>{newTabLabel}</span>
        </>
      ) : null}
    </>
  );
}

export function Link({ href, variant = 'text', newTabLabel, context, children }: LinkProps) {
  const safeHref = sanitizeUrl(href) ?? sanitizeInternalHref(href);
  if (safeHref === null) {
    // An invalid URL must never produce an <a>: show the text only, styled as plain text so it
    // does not look clickable.
    return <span className={styles.plainText}>{children}</span>;
  }
  // A blank label would open a tab without announcing it: stay in the same tab instead.
  const hasLabel = newTabLabel !== undefined && newTabLabel.trim() !== '';
  const opensNewTab = hasLabel && isExternalHttpsUrl(safeHref);
  return (
    <a
      href={safeHref}
      className={classNames(variant)}
      {...(opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      <HiddenSuffix context={context} newTabLabel={opensNewTab ? newTabLabel : undefined} />
    </a>
  );
}
