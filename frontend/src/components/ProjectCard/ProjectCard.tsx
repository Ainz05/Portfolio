import type { Project } from '@/types/project';
import { Heading } from '@/ui/Heading';
import { ImagePlaceholder } from '@/ui/ImagePlaceholder';
import { Link } from '@/ui/Link';
import { Tag } from '@/ui/Tag';
import styles from './ProjectCard.module.css';

export interface ProjectCardProps {
  readonly project: Project;
  /** Announced on links opening a new tab; passed down by app/. */
  readonly newTabLabel: string;
  /** Puts the screenshot before the text on wide screens (alternating rows). */
  readonly mirrored?: boolean;
}

export function ProjectCard({ project, newTabLabel, mirrored = false }: ProjectCardProps) {
  return (
    <article className={`${styles.card ?? ''} ${mirrored ? (styles.mirrored ?? '') : ''}`}>
      <div className={styles.text}>
        <Tag>{project.label}</Tag>
        <Heading level={3}>{project.title}</Heading>
        <p>{project.description}</p>
        <ul className={styles.list}>
          {project.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
        <ul className={styles.list}>
          {project.links.map((link) => (
            <li key={link.label}>
              <Link href={link.href} newTabLabel={newTabLabel} context={project.title}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.media}>
        <ImagePlaceholder label={project.screenshotPlaceholder} />
      </div>
    </article>
  );
}
