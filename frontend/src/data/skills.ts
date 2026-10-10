import type { SkillsContent } from '@/types/skill';

export const skills: SkillsContent = {
  id: 'outils',
  title: 'Avec quoi je travaille',
  columns: [
    {
      id: 'mettre-en-ligne',
      title: 'Mettre en ligne',
      description:
        "Docker pour emballer une application, Terraform pour décrire l'infrastructure, AWS pour l'héberger.",
    },
    {
      id: 'automatiser',
      title: 'Automatiser',
      description:
        'Git pour suivre le code, des pipelines CI/CD pour tester et déployer sans y repenser à chaque fois.',
    },
    {
      id: 'construire',
      title: 'Construire',
      description: 'React et TypeScript pour le web, C# avec .NET MAUI et Flutter pour le mobile.',
    },
  ],
  closing:
    "L'IA et le MLOps m'attirent aussi : faire passer un modèle du carnet de notes à la production, de façon fiable.",
};
