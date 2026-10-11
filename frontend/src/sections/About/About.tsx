import type { AboutContent } from '@/types/sections';
import { Heading } from '@/ui/Heading';
import { Section } from '@/ui/Section';
import styles from './About.module.css';

export interface AboutProps {
  readonly content: AboutContent;
}

export function About({ content }: AboutProps) {
  const titleId = `${content.id}-titre`;
  return (
    <Section id={content.id} titleId={titleId} tone="white">
      <div className={styles.layout}>
        <Heading level={2} id={titleId}>
          {content.title}
        </Heading>
        <div className={styles.text}>
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </Section>
  );
}
