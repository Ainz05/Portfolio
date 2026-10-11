import type { LinkItem } from '@/types/link';
import { Container } from '@/ui/Container';
import { Link } from '@/ui/Link';
import styles from './Header.module.css';

export interface HeaderProps {
  readonly logo: string;
  readonly navLabel: string;
  readonly skipLinkLabel: string;
  /** Anchor of the <main> element, e.g. "#contenu". */
  readonly skipLinkHref: string;
  readonly items: readonly LinkItem[];
}

export function Header({ logo, navLabel, skipLinkLabel, skipLinkHref, items }: HeaderProps) {
  return (
    <header className={styles.header}>
      {/* First focusable element: keyboard users can jump over the navigation. */}
      <span className={styles.skipLink}>
        <Link href={skipLinkHref} variant="primary">
          {skipLinkLabel}
        </Link>
      </span>
      <Container>
        <div className={styles.bar}>
          <p className={styles.logo}>{logo}</p>
          <nav aria-label={navLabel}>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} variant="nav">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}
