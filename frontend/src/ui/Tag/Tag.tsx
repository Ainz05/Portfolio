import styles from './Tag.module.css';
import type { ReactNode } from 'react';

export interface TagProps {
  readonly children: ReactNode;
}

/** Short, non-interactive label (project kind, technology list). */
export function Tag({ children }: TagProps) {
  return <span className={styles.tag}>{children}</span>;
}
