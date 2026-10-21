import type { HeroContent } from '@/types/sections';

export const hero: HeroContent = {
  id: 'accueil',
  eyebrow: 'Bienvenue sur mon portfolio.',
  titleBefore: "Salut, moi c'est ",
  titleHighlight: 'Florian',
  titleAfter: '.',
  paragraph:
    "Je suis étudiant en bac 3 en informatique, à la HELHa de Tournai. Je suis quelqu'un de sérieux dans son travail, qui aime comprendre comment les choses fonctionnent. Je cherche un stage de 15 semaines en DevOps ou en IA, du côté de Charleroi (je vis de ce côté), Mons ou Tournai.",
  primaryAction: { label: 'Me contacter', href: '#contact' },
  secondaryAction: {
    label: 'Télécharger mon CV',
    href: '[À COMPLÉTER : fichier du CV (PDF) dans frontend/public/cv/]',
  },
  photoPlaceholder: '[Ta photo ici]',
  photo: {
    file: 'florian.webp',
    alt: 'Portrait de Florian, cheveux bruns bouclés, lunettes transparentes et sweat noir',
    width: 800,
    height: 800,
  },
};
