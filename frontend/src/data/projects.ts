import type { ProjectsContent } from '@/types/project';

const SCREENSHOT = "[Capture d'écran du projet]";
const REPOSITORY = '[À COMPLÉTER : URL du dépôt]';
const DEMO = '[À COMPLÉTER : URL de la démo]';

export const projects: ProjectsContent = {
  id: 'projets',
  title: 'Mes projets',
  subtitle: "Quelques projets de l'école et d'à côté, avec ce que j'y ai appris.",
  projects: [
    {
      id: 'deployer-react',
      title: 'Déployer une application React',
      label: 'Projet scolaire · DevOps',
      description:
        "Je mets une application React en ligne : je la mets dans un conteneur avec Docker, je décris l'infrastructure avec Terraform sur AWS, et j'automatise les mises en ligne avec un pipeline CI/CD.",
      tags: ['Docker', 'AWS', 'Terraform', 'CI/CD'],
      links: [
        { label: 'Voir le code', href: REPOSITORY },
        { label: 'Voir la démo', href: DEMO },
      ],
      screenshotPlaceholder: SCREENSHOT,
      screenshot: {
        file: 'aws.webp',
        alt: 'Pipeline CI/CD du projet sur AWS',
        width: 1600,
        height: 447,
      },
    },
    {
      id: 'generateur-de-sites',
      title: 'Un générateur de sites web',
      label: 'Projet perso · Hébergement',
      description:
        'Saas-Orchestrator : plateforme d\'orchestration cloud et de déploiement automatisé de boutique de e-commerce (en cours de développement pour un vrai client).',
      tags: ['Cloud', 'hébergement', 'Docker', 'Terraform', 'CI/CD'],
      links: [{ label: 'Voir le code', href: REPOSITORY }],
      screenshotPlaceholder: SCREENSHOT,
    },
    {
      id: 'exercices-maths',
      title: "Mon portfolio",
      label: 'Projet perso',
      description:
        'Un portfolio présentant quelques uns de mes différents projets. Déployer avec Terraform, Ansible et Jenkins sur un VPS OVH.',
      tags: ['React', 'Agentic coding', 'Docker', 'Terraform', 'Jenkins', 'CI/CD', 'Ansible', 'OVH'],
      links: [
        { label: 'Voir le code', href: REPOSITORY },
        { label: 'Voir la démo', href: DEMO },
      ],
      screenshotPlaceholder: SCREENSHOT,
      screenshot: {
        file: 'portfolio.webp',
        alt: 'Capture d\'écran du portfolio',
        width: 1600,
        height: 665,
      },
    },
    {
      id: 'eventhub',
      title: 'Petit modèle d\'IA',
      label: 'Projet perso · IA',
      description: "[À COMPLÉTER : une phrase sur ce que fait l'application]",
      tags: ['Machine Learning', 'Python', 'IA'],
      links: [
        { label: 'Voir le code', href: REPOSITORY },
        { label: 'Voir la démo', href: DEMO },
      ],
      screenshotPlaceholder: SCREENSHOT,
    },
  ],
};
