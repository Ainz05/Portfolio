import type { SkillColumn as SkillColumnData } from '@/types/skill';
import { Heading } from '@/ui/Heading';
import styles from './SkillColumn.module.css';

export interface SkillColumnProps {
  readonly column: SkillColumnData;
}

export function SkillColumn({ column }: SkillColumnProps) {
  return (
    <div className={styles.column}>
      <Heading level={3}>{column.title}</Heading>
      <p className={styles.description}>{column.description}</p>
    </div>
  );
}
