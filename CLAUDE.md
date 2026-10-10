# Portfolio de Florian — Guide du projet

Site portfolio **100 % statique** en **React + TypeScript** (Vite). Pas de backend : le contact se fait par un lien `mailto:`. Le contenu et le design sont décrits dans `SPEC.md`. La maquette de référence est `docs/reference.png`.

## Structure du dépôt

```
portfolio/
├── CLAUDE.md              ← ce fichier (règles communes)
├── SPEC.md                ← contenu, sections, design tokens
├── docs/
│   ├── reference.png      ← maquette à respecter
│   └── DEPLOY-SECURITY.md ← en-têtes de sécurité à configurer chez l'hébergeur
├── frontend/              ← application React (voir frontend/CLAUDE.md)
└── .claude/
    ├── settings.json
    └── agents/
        ├── coder.md
        ├── pre-commit-reviewer.md
        └── security-reviewer.md
```

Avant de toucher au code, lire `frontend/CLAUDE.md` (architecture, normes, découplage). En cas de conflit, le `CLAUDE.md` le plus proche du fichier modifié gagne.

## Agents et rôles

| Agent | Rôle | Peut modifier le code ? |
|---|---|---|
| `coder` | Écrit le code, les tests, les commits | Oui |
| `pre-commit-reviewer` | Relit le diff **avant chaque commit** (qualité, normes, architecture) | Non |
| `security-reviewer` | Audite la sécurité, objectif **zéro faille** | Non |

## Workflow obligatoire (pour chaque unité de travail)

1. `coder` implémente une petite tâche (un composant, une section, un module).
2. `coder` lance `npm run check` (lint + typecheck + règles d'architecture + tests + build). Tout doit passer.
3. `coder` stage les fichiers (`git add`) mais **ne commit pas encore**.
4. `pre-commit-reviewer` relit `git diff --staged`.
   - `BLOQUÉ` → `coder` corrige, restage, retour à l'étape 2.
   - `OK` → étape 5.
5. Si le diff touche aux dépendances, à la config (Vite, en-têtes, CSP), aux liens externes, au `mailto`, au HTML d'entrée ou au déploiement : `security-reviewer` valide aussi. Tout constat `CRITIQUE` ou `ÉLEVÉ` bloque le commit.
6. `coder` commit (Conventional Commits).
7. À la fin de chaque phase et avant toute mise en ligne : audit complet par `security-reviewer`.

Aucun commit sans passage par `pre-commit-reviewer`. Pas de `--no-verify`, pas de `git push --force`.

## Principes de conception (obligatoires)

- **Découplage maximal** : chaque module a une seule responsabilité, dépend d'abstractions (props, types) et non de détails, et peut être supprimé ou testé sans toucher au reste. Les règles précises et leur contrôle automatique sont dans `frontend/CLAUDE.md`.
- **Séparation contenu / présentation / logique** : le texte vit dans `data/`, l'apparence dans les composants, la logique dans `lib/` et les hooks.
- **Normes** : TypeScript `strict`, ESLint + Prettier + EditorConfig, HTML5 valide, WCAG 2.2 niveau AA, Conventional Commits, SemVer pour les tags.
- **Simplicité** : la solution la plus simple qui respecte ce qui précède. Pas de généralisation prématurée, pas de dépendance superflue.

## Règles communes

- Langue du site : **français**. Code, noms, commentaires techniques : anglais.
- Aucun secret dans le dépôt. Le site étant statique, **tout ce qui est dans le bundle est public** : aucune clé, aucun token. L'adresse email de contact est publique par nature (voir `SPEC.md`) et vient d'une constante de configuration, pas d'un secret.
- Ne jamais inventer d'informations sur Florian : les champs manquants restent des placeholders visibles `[À COMPLÉTER : …]`, listés dans `SPEC.md`.
- Dépendances : peu nombreuses, maintenues, versions figées par le lockfile ; toute ajout justifié dans le message de commit.
- Responsive : mobile d'abord.
- Si une conteneurisation est ajoutée : image minimale, utilisateur non-root, serveur statique durci, aucun secret dans l'image.

## Commits

Conventional Commits : `feat(projects): ajoute la section Projets`, `fix(a11y): corrige le focus du menu`, `chore(deps): met à jour vite`. Un commit = un changement cohérent et petit. Scopes conseillés : `header`, `hero`, `projects`, `skills`, `about`, `contact`, `ui`, `styles`, `deps`, `config`, `a11y`, `docs`.

## Définition de « terminé »

- `npm run check` vert dans `frontend/` (lint, typecheck, architecture, tests, build).
- `npm audit --omit=dev` : aucune vulnérabilité `high` ou `critical`.
- Verdict `OK` du `pre-commit-reviewer` et du `security-reviewer`.
- Rendu comparé à `docs/reference.png` sur mobile et desktop.
- Lighthouse : performance, accessibilité, bonnes pratiques et SEO ≥ 95.
