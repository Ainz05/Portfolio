import type { ImageRef } from './image';
import type { LinkItem } from './link';

export interface Project {
  readonly id: string;
  readonly title: string;
  /** Short context line, e.g. "Projet scolaire · DevOps". */
  readonly label: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly links: readonly LinkItem[];
  /** Text shown in the dashed block until a real screenshot exists. */
  readonly screenshotPlaceholder: string;
  /** Real screenshot; the placeholder is shown while it is absent. */
  readonly screenshot?: ImageRef;
}

export interface ProjectsContent {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly projects: readonly Project[];
}
