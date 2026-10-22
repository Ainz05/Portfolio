import type { ContactContent } from '@/types/sections';
import { lastName } from './identity';
import { contactEmail } from './site';

export const contact: ContactContent = {
  id: 'contact',
  title: 'Pour me contacter',
  text: "Si vous avez un stage de 15 semaines en DevOps ou en IA, j'aimerais beaucoup en parler.",
  emailLabel: contactEmail,
  emailContext: 'écrire à Florian',
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/florian-gypen-b6309b410' },
    { label: 'GitHub', href: 'https://github.com/Ainz05' },
  ],
  footer: `© 2026 Florian ${lastName}`,
};
