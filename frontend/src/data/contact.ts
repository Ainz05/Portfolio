import type { ContactContent } from '@/types/sections';
import { lastName } from './identity';
import { contactEmail } from './site';

export const contact: ContactContent = {
  id: 'contact',
  title: 'On discute ?',
  text: "Si vous avez un stage de 15 semaines en DevOps, IA ou MLOps, j'aimerais beaucoup en parler.",
  emailLabel: contactEmail,
  socialLinks: [
    { label: 'LinkedIn', href: '[À COMPLÉTER : URL LinkedIn]' },
    { label: 'GitHub', href: '[À COMPLÉTER : URL GitHub]' },
  ],
  footer: `© 2026 Florian ${lastName}`,
};
