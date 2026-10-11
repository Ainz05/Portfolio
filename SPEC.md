# SPEC — Contenu et design du portfolio

Référence visuelle : `docs/reference.png`. Le rendu final doit lui ressembler fidèlement (mise en page, espacements, hiérarchie typographique, couleurs). Tout texte entre crochets est un **placeholder à ne pas inventer**.

## Design tokens (à ajuster en comparant à la maquette)

| Token | Valeur indicative | Usage |
|---|---|---|
| `--bg` | `#F7F8FB` | fond hero / sections claires alternées |
| `--surface` | `#FFFFFF` | sections blanches (Projets, À propos) |
| `--ink` | `#101D42` | titres, texte principal, fond du bloc contact |
| `--muted` | `#4A5470` | texte secondaire |
| `--accent` | `#FFD84D` | jaune : surlignage du prénom, photo, bouton email |
| `--primary` | `#2B5BE8` | bleu : bouton « Me contacter », liens |
| `--placeholder` | `#E8EBF4` | blocs de captures d'écran (bordure en pointillés) |

- Typographie : sans-serif géométrique (ex. DM Sans ou Plus Jakarta Sans), titres très gras et serrés, corps ~16–18 px, interligne confortable. Police auto-hébergée (pas de CDN tiers, voir règles sécurité).
- Largeur de contenu max ~1100 px, marges latérales ~100 px desktop, 16–24 px mobile.
- Boutons arrondis (pilule). Cartes/blocs image à coins arrondis.

## Sections (dans l'ordre)

### 0. Header
Logo texte `Florian [À COMPLÉTER : nom de famille]` à gauche. Navigation à droite : Projets, Outils, À propos, Contact (ancres vers les sections, défilement doux).

### 1. Hero
- Petite ligne : « Bienvenue sur mon portfolio. »
- Titre : « Salut, moi c'est **Florian**. » (prénom surligné en jaune).
- Paragraphe : « Je suis étudiant en bac 3 en informatique, en Belgique. J'aime comprendre comment une application passe de mon ordinateur à un vrai serveur, et automatiser tout ce chemin. Je cherche un stage de 15 semaines en DevOps, IA ou MLOps, du côté de Charleroi, Mons ou Tournai. »
- Boutons : « Me contacter » (primaire, ancre `#contact`) et « Télécharger mon CV » (secondaire, lien vers le PDF statique dans `frontend/public/cv/`).
- À droite : grand carré arrondi jaune avec la photo. Placeholder : `[Ta photo ici]`.

### 2. Mes projets
Titre « Mes projets », sous-titre « Quelques projets de l'école et d'à côté, avec ce que j'y ai appris. » Quatre projets en lignes alternées (texte/image, puis image/texte…). Chaque image est un bloc `[Capture d'écran du projet]` en pointillés tant que les vraies captures manquent.

1. **Déployer une application React** — étiquette « Projet scolaire · DevOps ». Description : « Je mets une application React en ligne de bout en bout : je la mets dans un conteneur avec Docker, je décris l'infrastructure avec Terraform sur AWS, et j'automatise les mises en ligne avec un pipeline CI/CD. » Tags : Docker, AWS, Terraform, CI/CD. Liens : Voir le code, Voir la démo.
2. **Un générateur de sites web** — « Projet perso · Hébergement ». « Une plateforme pour créer des sites web hébergés sur des machines virtuelles. Je la pense pour la production : je compare les hébergeurs sur le coût et la praticité avant de choisir. » Tags : Machines virtuelles, hébergement. Lien : Voir le code.
3. **Un site d'exercices de maths** — « Projet perso · IA ». « Un site en React avec des exercices classés par thèmes. On répond aux questions, et une IA peut en générer de nouvelles quand on a fait le tour. » Tags : React, IA générative. Liens : Voir le code, Voir la démo.
4. **EventHub** — « TP · Cours Web BA3 ». `[À COMPLÉTER : une phrase sur ce que fait l'application]`. Tags : React, TypeScript, Vite. Liens : Voir le code, Voir la démo.

Les données des projets vivent dans un fichier typé `frontend/src/data/projects.ts` (pas en dur dans les composants).

### 3. Avec quoi je travaille
Trois colonnes puis une phrase :
- **Mettre en ligne** : Docker pour emballer une application, Terraform pour décrire l'infrastructure, AWS pour l'héberger.
- **Automatiser** : Git pour suivre le code, des pipelines CI/CD pour tester et déployer sans y repenser à chaque fois.
- **Construire** : React et TypeScript pour le web, C# avec .NET MAUI et Flutter pour le mobile.
- Phrase : « L'IA et le MLOps m'attirent aussi : faire passer un modèle du carnet de notes à la production, de façon fiable. »

### 4. Un peu plus sur moi
Titre à gauche, trois paragraphes à droite :
1. « Je suis en bac 3 Technologie de l'informatique `[À COMPLÉTER : école]`. Ce que je préfère, c'est quand un projet tourne pour de vrai, pas seulement chez moi. »
2. « Au conseil étudiant, je suis chef de projet pour le premier événement de l'année : une distribution de bonbons d'Halloween à Tournai. Ça m'apprend à coordonner une équipe et à tenir un planning. »
3. « Je cherche un stage de 15 semaines où je pourrai apprendre auprès d'une équipe et rendre service très vite. »

### 5. Contact (fond bleu nuit)
- Titre « On discute ? » ; texte « Si vous avez un stage de 15 semaines en DevOps, IA ou MLOps, j'aimerais beaucoup en parler. »
- Bouton jaune `[À COMPLÉTER : adresse email publique]` = lien `mailto:` (objet pré-rempli, ex. « Stage DevOps / IA / MLOps — prise de contact ») + liens LinkedIn et GitHub. Pas de formulaire ni de backend.
- Pied de page : « © 2026 Florian [À COMPLÉTER : nom de famille] ».

Remarque : l'adresse email est publique dans le site (inévitable avec un `mailto:`) ; c'est un choix assumé, donc aucun autre contact personnel n'est affiché.

## Placeholders à compléter par Florian (ne pas inventer)

- photo (`[Ta photo ici]`)
- URL LinkedIn et GitHub, URL des dépôts et des démos de chaque projet
- Description d'EventHub
- Captures d'écran des 4 projets
- Fichier du CV (PDF) dans `frontend/public/cv/`

## Critères d'acceptation

- Les 6 blocs ci-dessus existent, dans l'ordre, avec le texte fourni mot pour mot.
- Rendu fidèle à `docs/reference.png` en desktop (≥ 1200 px) ; version mobile propre dès 360 px.
- Navigation ancrée fonctionnelle, focus visible, lecteur d'écran : un seul `h1`, hiérarchie `h2`/`h3` correcte.
- Lien `mailto:` fonctionnel (objet pré-rempli, bien encodé), sans faille (voir `security-reviewer`).
- Architecture respectant les couches et règles de découplage de `frontend/CLAUDE.md` (`npm run arch` vert).
- Tout le contenu textuel est dans `frontend/src/data/`, aucun texte en dur dans les composants.
- Aucun placeholder oublié silencieusement : chaque `[À COMPLÉTER]` restant est visible et listé dans le compte rendu final.
