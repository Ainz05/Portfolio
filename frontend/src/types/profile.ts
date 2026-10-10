import type { LinkItem } from './link';

export interface HeroContent {
  readonly eyebrow: string;
  /** The title is split so the first name can be highlighted without HTML in data. */
  readonly titleBefore: string;
  readonly titleHighlight: string;
  readonly titleAfter: string;
  readonly paragraph: string;
  readonly primaryAction: LinkItem;
  readonly secondaryAction: LinkItem;
  readonly photoPlaceholder: string;
}

export interface AboutContent {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export interface ContactContent {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  /** Visible text of the email button (placeholder until the public address is known). */
  readonly emailLabel: string;
  readonly socialLinks: readonly LinkItem[];
  readonly footer: string;
}
