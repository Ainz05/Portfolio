import styles from './Container.module.css';
import type { ReactNode } from 'react';

export interface ContainerProps {
  readonly children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <div className={styles.container}>{children}</div>;
}
