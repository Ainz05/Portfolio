import type { NavigationContent } from '@/types/navigation';
import { lastName } from './identity';

export const navigation: NavigationContent = {
  logo: `Florian ${lastName}`,
  ariaLabel: 'Navigation principale',
  skipLinkLabel: 'Aller au contenu',
  items: [
    { label: 'Projets', href: '#projets' },
    { label: 'Outils', href: '#outils' },
    { label: 'À propos', href: '#a-propos' },
    { label: 'Contact', href: '#contact' },
  ],
};
