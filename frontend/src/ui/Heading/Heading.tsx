import styles from './Heading.module.css';
import type { ReactNode } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps {
  /** Semantic level (document outline). */
  readonly level: HeadingLevel;
  /** Visual size, independent from the semantic level. Defaults to the level. */
  readonly size?: HeadingLevel;
  readonly id?: string;
  readonly children: ReactNode;
}

const TAGS = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;

export function Heading({ level, size = level, id, children }: HeadingProps) {
  const Tag = TAGS[level];
  return (
    <Tag id={id} className={`${styles.heading ?? ''} ${styles[`size${String(size)}`] ?? ''}`}>
      {children}
    </Tag>
  );
}
