import { resolveImage, type ImageUrls } from '@/lib/images';
import type { Project } from '@/types/project';
import { Heading } from '@/ui/Heading';
import { Link } from '@/ui/Link';
import { Picture } from '@/ui/Picture';
import { Tag } from '@/ui/Tag';
import styles from './ProjectCard.module.css';

export interface ProjectCardProps {
  readonly project: Project;
  /** Announced on links opening a new tab; passed down by app/. */
  readonly newTabLabel: string;
  /** Build URLs of the images in src/assets/images/, by file name. */
  readonly imageUrls: ImageUrls;
  /** Puts the screenshot before the text on wide screens (alternating rows). */
  readonly mirrored?: boolean;
}

type ProjectLinksProps = Pick<ProjectCardProps, 'project' | 'newTabLabel'>;

function ProjectLinks({ project, newTabLabel }: ProjectLinksProps) {
  return (
    <ul className={styles.list}>
      {project.links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} newTabLabel={newTabLabel} context={project.title}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({
  project,
  newTabLabel,
  imageUrls,
  mirrored = false,
}: ProjectCardProps) {
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
        <ProjectLinks project={project} newTabLabel={newTabLabel} />
      </div>
      <div className={styles.media}>
        <Picture
          image={resolveImage(project.screenshot, imageUrls)}
          placeholder={project.screenshotPlaceholder}
        />
      </div>
    </article>
  );
}
