import { Container } from '@/ui/Container';
import styles from './Section.module.css';
import type { ReactNode } from 'react';

export type SectionTone = 'light' | 'white' | 'dark';

export interface SectionProps {
  /** Anchor id, target of the navigation links. */
  readonly id: string;
  /** Id of the heading inside the section: gives the landmark its accessible name. */
  readonly titleId: string;
  readonly tone?: SectionTone;
  readonly children: ReactNode;
}

export function Section({ id, titleId, tone = 'light', children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`${styles.section ?? ''} ${styles[tone] ?? ''}`}
    >
      <Container>{children}</Container>
    </section>
  );
}
