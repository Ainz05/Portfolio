import type { HeroContent } from '@/types/sections';

export const hero: HeroContent = {
  eyebrow: 'Bienvenue sur mon portfolio.',
  titleBefore: "Salut, moi c'est ",
  titleHighlight: 'Florian',
  titleAfter: '.',
  paragraph:
    "Je suis étudiant en bac 3 en informatique, en Belgique. J'aime comprendre comment une application passe de mon ordinateur à un vrai serveur, et automatiser tout ce chemin. Je cherche un stage de 15 semaines en DevOps, IA ou MLOps, du côté de Charleroi, Mons ou Tournai.",
  primaryAction: { label: 'Me contacter', href: '#contact' },
  secondaryAction: {
    label: 'Télécharger mon CV',
    href: '[À COMPLÉTER : fichier du CV (PDF) dans frontend/public/cv/]',
  },
  photoPlaceholder: '[Ta photo ici]',
};
