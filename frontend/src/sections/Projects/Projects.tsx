import { ProjectCard } from '@/components/ProjectCard';
import type { ImageUrls } from '@/lib/images';
import type { ProjectsContent } from '@/types/project';
import { Heading } from '@/ui/Heading';
import { Section } from '@/ui/Section';
import styles from './Projects.module.css';

export interface ProjectsProps {
  readonly content: ProjectsContent;
  /** Announced on links opening a new tab. */
  readonly newTabLabel: string;
  readonly imageUrls: ImageUrls;
}

export function Projects({ content, newTabLabel, imageUrls }: ProjectsProps) {
  const titleId = `${content.id}-titre`;
  return (
    <Section id={content.id} titleId={titleId} tone="white">
      <div className={styles.header}>
        <Heading level={2} id={titleId}>
          {content.title}
        </Heading>
        <p className={styles.subtitle}>{content.subtitle}</p>
      </div>
      <ul className={styles.list}>
        {content.projects.map((project, index) => (
          <li key={project.id}>
            <ProjectCard
              project={project}
              newTabLabel={newTabLabel}
              imageUrls={imageUrls}
              mirrored={index % 2 === 1}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
