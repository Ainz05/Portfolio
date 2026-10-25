import type { SkillsContent } from '@/types/skill';

export const skills: SkillsContent = {
  id: 'outils',
  title: 'Avec quoi j’ai déjà travaillé ?',
  columns: [
    {
      id: 'mettre-en-ligne',
      title: 'Mettre en ligne',
      description:
        'Docker pour les conteneurs, Terraform et Ansible pour décrire et configurer l’infrastructure, AWS (ECR, IAM) et OVH pour l’héberger.',
    },
    {
      id: 'automatiser',
      title: 'Automatiser',
      description:
        'Git pour suivre le code, Jenkins et GitHub Actions pour construire et déployer automatiquement à chaque modification. J’ai aussi utilisé les outils natifs d’AWS : CodePipeline, CodeBuild et CodeDeploy.',
    },
    {
      id: 'construire',
      title: 'Construire',
      description:
        'React et TypeScript pour le web, C# avec .NET MAUI et Flutter pour le mobile. Python pour l’IA.',
    },
  ],
  closing:
    "L'IA et le MLOps m'attirent aussi : cours de Machine Learning et de Deep Learning en deuxième année. Actuellement en cours d'apprentissage du MLOps en autodidacte. Je peux également apprendre toute nouvelle technologie nécessaire.",
};
