import { SkillColumn } from '@/components/SkillColumn';
import type { SkillsContent } from '@/types/skill';
import { Heading } from '@/ui/Heading';
import { Section } from '@/ui/Section';
import styles from './Skills.module.css';

export interface SkillsProps {
  readonly content: SkillsContent;
}

export function Skills({ content }: SkillsProps) {
  const titleId = `${content.id}-titre`;
  return (
    <Section id={content.id} titleId={titleId} tone="light">
      <div className={styles.layout}>
        <Heading level={2} id={titleId}>
          {content.title}
        </Heading>
        <ul className={styles.columns}>
          {content.columns.map((column) => (
            <li key={column.id}>
              <SkillColumn column={column} />
            </li>
          ))}
        </ul>
        <p className={styles.closing}>{content.closing}</p>
      </div>
    </Section>
  );
}
