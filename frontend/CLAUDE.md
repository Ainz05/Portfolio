# Frontend — React + TypeScript + Vite

Voir d'abord `../CLAUDE.md` (règles communes) et `../SPEC.md` (contenu et design).

## Stack

- React 18+, TypeScript `strict`, Vite. Site statique (`npm run build` → `dist/`).
- Style : CSS Modules + variables CSS pour les design tokens (`src/styles/tokens.css`). Pas de second système de style.
- Tests : Vitest + React Testing Library + `@testing-library/user-event` ; `vitest-axe` pour l'accessibilité.
- Qualité : ESLint (`typescript-eslint` strict, `react-hooks`, `jsx-a11y`, `import`, `eslint-plugin-boundaries`), Prettier, EditorConfig, `dependency-cruiser`.
- Aucune bibliothèque UI, aucun état global, aucun routeur : une seule page.

## Architecture en couches (découplage)

Le code est organisé en couches. **Une couche ne peut importer que des couches situées en dessous d'elle.**

```
src/
├── app/            ← 5. composition : App.tsx, main.tsx, assemblage des sections  (importe tout)
├── sections/       ← 4. blocs de page : Hero, Projects, Skills, About, Contact      (importe components, ui, hooks, lib, types)
├── components/     ← 3. composants métier réutilisables : ProjectCard, SkillColumn  (importe ui, lib, types)
├── ui/             ← 2. primitives génériques sans métier : Button, Link, Section, Heading, Tag, ImagePlaceholder, Container (importe lib, types)
├── hooks/          ← 2. hooks génériques : useScrollSpy, useReducedMotion          (importe lib, types)
├── lib/            ← 1. fonctions pures sans React ni DOM : mailto.ts, url.ts       (importe types)
├── types/          ← 0. types partagés, sans aucune logique                          (n'importe rien)
├── data/           ← contenu typé (projects.ts, skills.ts, profile.ts, site.ts) : n'importe que types/
└── styles/         ← tokens.css, global.css, reset.css
```

### Règles de découplage (vérifiées automatiquement)

1. **Sens unique des dépendances** : jamais de remontée (`ui/` n'importe pas `components/`, `lib/` n'importe pas React…). Aucune dépendance circulaire.
2. **Les sections ne s'importent pas entre elles**, les composants non plus. Ce qui est partagé descend d'une couche.
3. **`ui/` ignore le métier** : un `Button` ne sait rien des projets ni de l'email. Tout est piloté par des props.
4. **Le contenu ne vit jamais dans le JSX** : les sections reçoivent leurs données par props ; seul `app/` lit `data/` et les injecte. Changer un texte = modifier `data/`, rien d'autre.
5. **API publique par module** : chaque dossier de composant expose un `index.ts` ; on n'importe jamais « en profondeur » dans les fichiers internes d'un autre module.
6. **Composition plutôt qu'héritage ni configuration lourde** : préférer `children` et des props simples aux gros objets de configuration ou aux booléens en cascade.
7. **Aucun accès direct à `window`/`document`/`navigator`** hors de `hooks/` ou de `app/` ; la logique pure reste testable sans navigateur.
8. **Dépendances injectées** : une constante de configuration (adresse de contact, URL des dépôts) est lue dans `data/site.ts` et passée par props, pas importée dans un composant.
9. Un composant = un fichier = une responsabilité. Si un composant fait deux choses, on le sépare.

Contrôle : `npm run arch` (dependency-cruiser + `eslint-plugin-boundaries`) échoue si une règle est violée, y compris cycle ou import interdit. La config est versionnée (`.dependency-cruiser.cjs`) et ne doit pas être affaiblie sans demande explicite de Florian.

### Structure d'un composant

```
components/ProjectCard/
├── ProjectCard.tsx
├── ProjectCard.module.css
├── ProjectCard.test.tsx
└── index.ts          ← export { ProjectCard } + type ProjectCardProps
```

## Normes de code

**TypeScript**
- `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`. Pas de `any`, pas d'assertion `as` sauf justification en commentaire, pas de `@ts-ignore`.
- Types de domaine dans `types/` (ex. `Project`, `Skill`). Props : `interface XxxProps`, `readonly` par défaut.
- Préférer `type` pour les unions, `interface` pour les formes d'objets ; pas d'`enum` (utiliser des unions de littéraux).

**React**
- Composants fonctionnels et purs, un export nommé par fichier (pas d'export par défaut sauf `App`).
- Pas de `useEffect` pour dériver des données ; pas de `useMemo`/`useCallback` sans mesure. Clés de liste stables (jamais l'index si l'ordre peut changer).
- Pas de logique dans le JSX au-delà d'un ternaire simple : extraire en fonction ou hook.

**Qualité mesurable**
- Fichier ≤ 150 lignes, fonction ≤ 30 lignes, complexité cyclomatique ≤ 10, ≤ 5 props par composant (au-delà : regrouper ou composer). Imposé par ESLint (`max-lines`, `max-lines-per-function`, `complexity`).
- Nommage : composants `PascalCase`, hooks `useXxx`, fonctions/variables `camelCase`, constantes `SCREAMING_SNAKE_CASE`, fichiers de composants `PascalCase.tsx`, autres `camelCase.ts`, dossiers `kebab-case` ou `PascalCase` pour les composants. Noms explicites, pas d'abréviations obscures.
- Imports : ordre automatique (`import/order`), alias `@/` vers `src/`, pas de chemins relatifs remontants (`../../`).
- Commentaires : expliquer le **pourquoi**, jamais le quoi. Pas de code commenté, pas de `console.*`, pas de `TODO` sans ticket.

**HTML / CSS**
- HTML5 valide et sémantique ; CSS en `rem`, mobile d'abord, pas de `!important`, pas de valeur de couleur ou d'espacement « en dur » hors `tokens.css`.
- Les captures manquantes utilisent le composant `ImagePlaceholder`.

**Accessibilité (WCAG 2.2 AA)**
- Un seul `<h1>`, landmarks (`header`, `nav`, `main`, `section[aria-labelledby]`, `footer`), lien d'évitement « Aller au contenu ».
- Focus visible, ordre logique, contraste ≥ 4,5:1 (vérifier texte sur jaune et sur bleu nuit), cibles tactiles ≥ 24 px.
- `prefers-reduced-motion` respecté (pas de défilement doux ni d'animation dans ce cas).
- Chaque test de composant inclut une vérification `axe`.

## Contact par `mailto:`

- La logique vit dans `lib/mailto.ts` (fonction pure : `buildMailto({ to, subject, body })`, avec `encodeURIComponent` sur chaque paramètre, retours à la ligne encodés, longueur bornée) et est testée. Elle renvoie `string | null` : `null` quand l'adresse est un placeholder ou qu'une entrée est invalide ou dangereuse ; l'appelant affiche alors le texte sans lien. Même contrat pour `sanitizeUrl` dans `lib/url.ts`.
- L'adresse vient de `data/site.ts` (`contactEmail`) ; elle est publique. Aucune autre donnée personnelle (téléphone, adresse postale) dans le code.
- Le bouton est un lien `<a href="mailto:…">` (jamais un `window.location` en JS) avec un nom accessible explicite, et un texte visible de secours avec l'adresse.
- Pas de formulaire : aucune saisie utilisateur n'est traitée par le site.

## Sécurité côté site statique (non négociable)

- **Interdits** : `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`. Si un besoin de HTML riche apparaît, s'arrêter et demander.
- Liens externes : `target="_blank"` toujours avec `rel="noopener noreferrer"`. Toutes les URL de `data/` sont validées par `lib/url.ts` (schéma `https:` ou `mailto:` uniquement, jamais `javascript:` ni `data:`) et ce contrôle est testé.
- Aucun secret ni variable `VITE_*` sensible (elles finissent dans le bundle public).
- **Aucune ressource tierce** (CDN, police distante, script d'analytics, iframe) : tout est auto-hébergé, ce qui permet une CSP stricte `default-src 'self'`. Pas de script inline ni de style inline injecté dynamiquement.
- Build de production : `build.sourcemap: false`, pas de `console` ni de `debugger`.
- Les en-têtes de sécurité (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`, HSTS) ne dépendent pas du code : ils sont décrits dans `../docs/DEPLOY-SECURITY.md` et appliqués chez l'hébergeur.
- `npm audit --omit=dev` avant tout commit touchant `package.json` ; lockfile commité ; installation par `npm ci`.

## Performance

- Lighthouse ≥ 95. JS initial ≤ 150 kB gzip. Polices auto-hébergées, sous-ensemble latin, `font-display: swap`, 2 graisses au départ.
- Images : dimensions renseignées, `loading="lazy"` hors hero, WebP/AVIF quand les vraies captures arrivent.

## Scripts `package.json` obligatoires

```json
{
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "lint": "eslint . --max-warnings=0 && prettier --check .",
  "typecheck": "tsc --noEmit",
  "arch": "depcruise src --config .dependency-cruiser.cjs",
  "test": "vitest run",
  "check": "npm run lint && npm run typecheck && npm run arch && npm run test && npm run build"
}
```

## Check avant de rendre une tâche

- [ ] `npm run check` vert
- [ ] Rendu comparé à `docs/reference.png` (desktop et mobile)
- [ ] Aucune règle d'architecture contournée ; aucun import de couche supérieure
- [ ] Textes uniquement dans `data/`, conformes à `SPEC.md`
- [ ] Navigation clavier testée, un seul `h1`, test `axe` présent
- [ ] Aucun `dangerouslySetInnerHTML`, aucun secret, aucune ressource tierce
- [ ] Fichiers stagés, **pas encore commités** → passer la main à `pre-commit-reviewer`
