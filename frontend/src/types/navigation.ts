import type { LinkItem } from './link';

export interface NavigationContent {
  readonly logo: string;
  readonly ariaLabel: string;
  readonly skipLinkLabel: string;
  readonly items: readonly LinkItem[];
}
