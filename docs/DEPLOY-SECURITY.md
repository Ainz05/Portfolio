# Sécurité du déploiement (site statique)

Le site n'a pas de backend : la sécurité repose sur (1) un code sans ressource tierce ni injection possible, et (2) les **en-têtes HTTP posés par l'hébergeur**. Ce document est la référence du `security-reviewer`. L'hébergeur n'est pas encore choisi : adapter la syntaxe (fichier `_headers`, `netlify.toml`, `vercel.json`, config Nginx/Caddy, règles CloudFront…).

## En-têtes exigés sur toutes les réponses

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

Notes :
- `style-src 'self'` impose des feuilles CSS externes (pas de `<style>` inline, pas d'attribut `style` généré). Vite produit des fichiers CSS : compatible.
- `X-Frame-Options: DENY` double `frame-ancestors 'none'` pour les navigateurs anciens.
- `Cross-Origin-Resource-Policy: same-origin` est cohérent tant qu'aucun autre site n'intègre les ressources de celui-ci (pas d'image de partage hébergée ici et chargée ailleurs sans test préalable).
- Si l'hébergeur ne permet pas de poser des en-têtes, ajouter une balise `<meta http-equiv="Content-Security-Policy">` dans `index.html` en secours (elle ne gère pas `frame-ancestors`), et le noter comme limite dans l'audit.
- Ajouter `preload` à HSTS seulement quand le domaine et ses sous-domaines sont durablement en HTTPS.

## Exemples de configuration

La CSP ci-dessus est compatible avec le build Vite actuel (scripts et feuilles de style externes, aucun inline). Si une dépendance future ajoute du JS ou du CSS inline, corriger le code plutôt qu'assouplir la CSP.

### Netlify / Cloudflare Pages : fichier `_headers`

À placer dans `frontend/public/_headers` (copié tel quel dans `dist/`). Les règles `/` et `/index.html` sont identiques : la racine sert `index.html`.

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache
```

### Vercel : `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### Nginx

Les directives `add_header` d'un bloc `location` **remplacent** celles héritées du `server`. Les en-têtes de sécurité sont donc dans un fichier unique, inclus au niveau `server` et dans chaque `location` qui ajoute son propre `add_header`.

`/etc/nginx/security_headers.conf` :

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
```

Configuration du site :

```nginx
server_tokens off;

server {
  listen 80;
  server_name <domaine>;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  http2 on;
  server_name <domaine>;

  ssl_certificate     /path/to/fullchain.pem;
  ssl_certificate_key /path/to/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  root /usr/share/nginx/html;   # contenu de dist/ uniquement
  index index.html;
  autoindex off;

  include /etc/nginx/security_headers.conf;

  location / {
    try_files $uri $uri/ =404;
  }

  location /assets/ {
    include /etc/nginx/security_headers.conf;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location = /index.html {
    include /etc/nginx/security_headers.conf;
    add_header Cache-Control "no-cache";
  }

  location ~ /\. { deny all; }
  location ~ \.map$ { return 404; }
}
```

### Secours sans en-têtes : balise `<meta>`

Le build de production injecte automatiquement (`vite.config.ts`, plugin `csp-meta`) une balise `<meta http-equiv="Content-Security-Policy">` avec la même politique, moins `frame-ancestors` (ignoré dans une balise `<meta>`). Elle n'est pas appliquée en `npm run dev`, où React Fast Refresh a besoin d'un script inline. Les vrais en-têtes restent requis : la balise ne couvre ni HSTS, ni `nosniff`, ni l'anti-clickjacking.

## Autres exigences

- HTTPS obligatoire, redirection automatique de HTTP vers HTTPS, TLS ≥ 1.2.
- Ne publier que le contenu de `dist/` : pas de `.git`, `.env`, `package.json`, `*.map`, ni listing de répertoire.
- Pas d'en-tête `Server`/`X-Powered-By` détaillé.
- Cache : fichiers hachés de `assets/` en `Cache-Control: public, max-age=31536000, immutable` ; `index.html` en `no-cache`.
- Le CV PDF servi est nettoyé de ses métadonnées (auteur, logiciel, chemins).

## Vérification après déploiement

```bash
curl -sI https://<domaine> | sort
curl -sI https://<domaine>/assets/<fichier-hache>.js
curl -sI http://<domaine>        # doit rediriger vers https
```

Outils complémentaires : Mozilla Observatory, `securityheaders.com`, Lighthouse (bonnes pratiques).

## Journal des risques acceptés

### GHSA-vfj7-8cjw-p6xm : `braces@3.0.3` (accepté le 2026-10-10)

- Chaîne : `eslint-plugin-boundaries` → `@boundaries/elements` → `micromatch@4.0.8` → `braces@3.0.3`.
- Impact : déni de service (épuisement de pile) du **processus ESLint** uniquement. Dépendance de développement, absente du bundle publié.
- Exposition : l'entrée est maîtrisée, ce sont les motifs versionnés dans `frontend/eslint.config.js`, jamais une saisie externe.
- Correctif amont : aucun à ce jour. Ne pas tenter d'override de `braces`.
- Barrière bloquante : `npm audit --omit=dev --audit-level=high` doit rester à zéro. Ne jamais lancer `npm audit fix --force`.
- Décision : Florian conserve `eslint-plugin-boundaries`. Réévaluation au plus tard le **2027-01-10** (correctif amont ou alternative).

## Journal

À chaque audit complet, noter ici la date, le verdict du `security-reviewer` et les points restés « non vérifiés ».
