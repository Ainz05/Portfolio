# Sécurité du déploiement (site statique)

Le site n'a pas de backend : la sécurité repose sur (1) un code sans ressource tierce ni injection possible, et (2) les **en-têtes HTTP posés par l'hébergeur**. Ce document est la référence du `security-reviewer`.

## Hébergement cible

VPS auto-hébergé avec **Nginx**. L'exemple Nginx ci-dessous est la configuration de référence.

Hypothèse : le site est servi à la **racine d'un domaine** (`https://<domaine>/`). `base: '/'` de Vite, les chemins `/assets/` et `/cv/` et la validation de `sanitizeInternalHref` (chemins absolus `/…`) en dépendent. Si le site est un jour servi sous un sous-chemin : définir `base` dans `vite.config.ts`, préfixer les chemins internes dans `app/` avec `import.meta.env.BASE_URL`, puis revalider (tests, CSP, en-têtes, liens).

## En-têtes exigés sur toutes les réponses

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
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
- `img-src 'self'` exclut `data:` : si un besoin d'image apparaît, préférer un fichier dans `assets/` plutôt qu'une URL `data:`.
- Ajouter `preload` à HSTS seulement quand le domaine et ses sous-domaines sont durablement en HTTPS.
- `includeSubDomains` impose HTTPS à **tous** les sous-domaines du domaine : le retirer si d'autres sous-domaines non HTTPS existent sur le VPS.
- La CSP ci-dessus est compatible avec le build Vite actuel (scripts et feuilles de style externes, aucun inline). Si une dépendance future ajoute du JS ou du CSS inline, corriger le code plutôt qu'assouplir la CSP.

## Exemples de configuration

### Netlify / Cloudflare Pages : fichier `_headers` (alternative non retenue)

À placer dans `frontend/public/_headers` (copié tel quel dans `dist/`). Les règles `/` et `/index.html` sont identiques : la racine sert `index.html`.

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
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

### Vercel : `vercel.json` (alternative non retenue)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests" },
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

### Nginx (configuration de référence)

Les directives `add_header` d'un bloc `location` **remplacent** celles héritées du `server`. Les en-têtes de sécurité sont donc dans un fichier unique, inclus au niveau `server` et dans chaque `location` qui ajoute son propre `add_header`.

`/etc/nginx/security_headers.conf` :

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests" always;
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

# Limitation de débit (optionnelle) : la zone se déclare dans le contexte http.
# limit_req_zone $binary_remote_addr zone=site:10m rate=20r/s;

# Serveurs fourre-tout : toute requête dont l'hôte (ou l'IP) n'est pas <domaine> est refusée.
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  return 444;
}

server {
  listen 443 ssl default_server;
  listen [::]:443 ssl default_server;
  ssl_reject_handshake on;   # Nginx >= 1.19.4 ; aucun certificat requis ici
}

server {
  listen 80;
  listen [::]:80;
  server_name <domaine>;

  # Certbot (mode webroot) : le défi ACME doit rester servi en HTTP, avant la redirection.
  # Webroot dédié (/var/www/certbot), jamais la racine du site.
  location ^~ /.well-known/acme-challenge/ {
    root /var/www/certbot;
    default_type text/plain;
    try_files $uri =404;
  }

  location / {
    # Domaine fixe plutôt que $host : pas de redirection vers un Host arbitraire.
    return 301 https://<domaine>$request_uri;
  }
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;   # Nginx >= 1.25.1 ; sinon : listen 443 ssl http2;
  server_name <domaine>;

  ssl_certificate     /path/to/fullchain.pem;
  ssl_certificate_key /path/to/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;   # profil Mozilla « intermediate »
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;
  ssl_session_tickets off;

  root /usr/share/nginx/html;   # contenu de dist/ uniquement
  index index.html;
  autoindex off;
  client_max_body_size 1k;      # site statique : aucun corps de requête utile

  # limit_req zone=site burst=40 nodelay;

  include /etc/nginx/security_headers.conf;

  location / {
    limit_except GET { deny all; }   # GET (et HEAD) seulement
    try_files $uri $uri/ =404;
  }

  location /assets/ {
    limit_except GET { deny all; }
    include /etc/nginx/security_headers.conf;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location = /index.html {
    limit_except GET { deny all; }
    include /etc/nginx/security_headers.conf;
    add_header Cache-Control "no-cache";
  }

  location ~ /\. { return 404; }
  location ~ \.map$ { return 404; }
}
```

Ne pas activer l'OCSP stapling : Let's Encrypt a arrêté OCSP en 2025.

Vérifier que le `mime.types` de Nginx contient `font/woff2 woff2;` et `application/pdf pdf;` : avec `nosniff`, un type absent ou erroné fait refuser la police ou le PDF.

### Durcissement du VPS (hors Nginx)

Liste volontairement courte, non exhaustive :
- Pare-feu n'ouvrant que les ports 22, 80 et 443.
- SSH par clé uniquement : pas de connexion root, pas de mot de passe.
- Mises à jour automatiques de sécurité activées.
- Renouvellement automatique de certbot (et vérifier qu'il fonctionne : `certbot renew --dry-run`).
- Le webroot appartient à un utilisateur non-root ; Nginx n'y a qu'un accès en lecture seule (webroot non inscriptible par Nginx), et ses workers tournent sans privilège (`user www-data;`).
- fail2ban (ou CrowdSec) sur `sshd`, `MaxAuthTries 3` et `AllowUsers <utilisateur>` dans la configuration SSH.
- Journaux Nginx en rotation (logrotate) avec conservation bornée à quelques semaines : les adresses IP sont des données personnelles (RGPD).
- Surveiller le renouvellement certbot (échec = alerte avant l'expiration du certificat).
- Déploiement par `rsync --delete` du seul contenu de `dist/`, avec un utilisateur de déploiement dédié, sans `sudo`.

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
nginx -t                                                  # configuration valide
curl -sI https://<domaine> | sort                         # 200 + tous les en-têtes exigés
curl -sI https://<domaine>/assets/<police>.woff2          # Content-Type: font/woff2
curl -sI https://<domaine>/assets/<fichier-hache>.js      # Cache-Control immutable
curl -sI https://<domaine>/cv/<fichier>.pdf               # Content-Type: application/pdf
curl -sI https://<domaine>/page-inexistante               # 404
curl -sI https://<domaine>/.git/config                    # 404
curl -sI http://<domaine>                                 # 301 vers https://<domaine>/
curl -skI https://<IP-du-serveur>                         # handshake rejeté (erreur TLS)
```

Test TLS : SSL Labs ou `testssl.sh <domaine>`. Outils complémentaires : Mozilla Observatory, `securityheaders.com`, Lighthouse (bonnes pratiques).

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
