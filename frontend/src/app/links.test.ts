import { contactEmail, contactSubject } from '@/data/site';
import { sanitizeInternalHref } from '@/lib/internalHref';
import { buildMailto } from '@/lib/mailto';
import { sanitizeUrl } from '@/lib/url';
import { allData, collectHrefs } from './dataCollectors.test-utils';

/*
 * Guards for the links written in data/. When you add your real links, edit the constants below:
 *
 * - GITHUB_ACCOUNT: your GitHub user name (for example 'florian-gypen'). Every github.com link
 *   must then start with https://github.com/<GITHUB_ACCOUNT>/. While it is empty, any real
 *   GitHub link makes the tests fail on purpose.
 * - GITHUB_EXTRA_REPOS: repositories owned by someone else (a group project), as 'owner/repo'.
 *   Only that exact repository is allowed, not the rest of the owner's account.
 * - DEMO_HOSTS: the domains where your project demos are hosted (for example
 *   'mon-projet.example.com'). Empty on purpose: add each domain deliberately.
 * - The CV: put the PDF in frontend/public/cv/ (for example florian-gypen.pdf) and use the link
 *   '/cv/florian-gypen.pdf' in data/hero.ts. The file must exist.
 *
 * Also refused: query strings, fragments, ports, URL shorteners, LinkedIn pages other than
 * /in/<slug>, any mailto other than the one built from data/site.ts, other internal paths.
 * Placeholders ([À COMPLÉTER : …]) are accepted until you replace them.
 */
const GITHUB_ACCOUNT = 'Ainz05';
const GITHUB_EXTRA_REPOS: readonly string[] = ['b-damien/DevOps1'];
const DEMO_HOSTS: readonly string[] = ['youtu.be'];

const PLACEHOLDER = /^\[À COMPLÉTER : [^\]]+\]$/;
const SHORTENER_HOSTS = ['bit.ly', 't.co', 'tinyurl.com', 'lnkd.in', 'goo.gl', 'ow.ly', 'is.gd'];
const PROFILE_HOSTS = ['github.com', 'www.linkedin.com'];
const LINKEDIN_PROFILE = /^\/in\/[A-Za-z0-9-]+\/?$/;

interface LinkRules {
  readonly githubAccount: string;
  readonly githubExtraRepos: readonly string[];
  readonly demoHosts: readonly string[];
  readonly cvFiles: readonly string[];
  readonly expectedMailto: string | null;
}

function isUnder(path: string, prefix: string): boolean {
  const base = `/${prefix.toLowerCase()}`;
  return path === base || path.startsWith(`${base}/`);
}

function githubProblem(pathname: string, rules: LinkRules): string | null {
  if (rules.githubAccount === '') {
    return 'GITHUB_ACCOUNT is empty: set it in links.test.ts before adding GitHub links';
  }
  const prefixes = [rules.githubAccount, ...rules.githubExtraRepos];
  const allowed = prefixes.some((prefix) => isUnder(pathname.toLowerCase(), prefix));
  return allowed ? null : 'GitHub account not allowed';
}

function pathProblem(url: URL, rules: LinkRules): string | null {
  if (url.pathname.includes('%') && PROFILE_HOSTS.includes(url.hostname)) {
    return 'encoded characters in the path';
  }
  if (url.hostname === 'github.com') {
    return githubProblem(url.pathname, rules);
  }
  if (url.hostname === 'www.linkedin.com') {
    return LINKEDIN_PROFILE.test(url.pathname) ? null : 'LinkedIn page is not /in/<slug>';
  }
  return null;
}

function httpsProblem(safe: string, rules: LinkRules): string | null {
  const url = new URL(safe);
  const allowed = ['github.com', 'www.linkedin.com', ...rules.demoHosts];
  if (SHORTENER_HOSTS.includes(url.hostname)) {
    return 'URL shortener';
  }
  if (!allowed.includes(url.hostname)) {
    return 'host not allowed';
  }
  if (url.port !== '' || url.search !== '' || url.hash !== '') {
    return 'port, query string or fragment';
  }
  return pathProblem(url, rules);
}

function internalProblem(href: string, cvFiles: readonly string[]): string | null {
  if (sanitizeInternalHref(href) === null) {
    return 'invalid link';
  }
  if (href.startsWith('#')) {
    return null;
  }
  if (!href.startsWith('/cv/')) {
    return 'internal path not allowed';
  }
  return cvFiles.some((path) => path.endsWith(`/public${href}`)) ? null : 'missing CV file';
}

/** Returns why a link from data/ is refused, or null when it is acceptable. */
function linkProblem(href: string, rules: LinkRules): string | null {
  if (PLACEHOLDER.test(href)) {
    return null;
  }
  const safe = sanitizeUrl(href);
  if (safe?.startsWith('https:')) {
    return httpsProblem(safe, rules);
  }
  if (safe?.startsWith('mailto:')) {
    return safe === rules.expectedMailto ? null : 'unexpected mailto address';
  }
  return internalProblem(href, rules.cvFiles);
}

// Lazy loaders are never called: only the file names matter.
const cvFiles = Object.keys(import.meta.glob('../../public/cv/*'));
const realRules: LinkRules = {
  githubAccount: GITHUB_ACCOUNT,
  githubExtraRepos: GITHUB_EXTRA_REPOS,
  demoHosts: DEMO_HOSTS,
  cvFiles,
  expectedMailto: buildMailto({ to: contactEmail, subject: contactSubject }),
};
const testRules: LinkRules = {
  githubAccount: 'compte-test',
  githubExtraRepos: ['autre/projet'],
  demoHosts: [],
  cvFiles: ['../../public/cv/cv.pdf'],
  expectedMailto: 'mailto:a@example.com',
};

describe('links in data/', () => {
  it.each(collectHrefs(allData).map((href) => [href]))('accepts %s', (href) => {
    expect(linkProblem(href, realRules)).toBeNull();
  });
});

describe('link rules', () => {
  it.each([
    'https://github.com/compte-test/repo',
    'https://github.com/Compte-Test',
    'https://www.linkedin.com/in/slug/',
    '#contact',
    '/cv/cv.pdf',
    'mailto:a@example.com',
    '[À COMPLÉTER : URL GitHub]',
  ])('accepts %s', (href) => {
    expect(linkProblem(href, testRules)).toBeNull();
  });

  it.each([
    'HTTPS://evil.example.com/',
    'https://github.com:8443/compte-test/x',
    'https://github.com/autre-compte/repo',
    'https://github.com/compte-test-bis/repo',
    'https://github.com/compte-test/repo?utm_source=x',
    'https://github.com/compte-test/repo#readme',
    'https://github.com/compte-test/..%2Fautre',
    'https://github.com/compte-test/%2e%2e/autre',
    'https://www.linkedin.com/in/slug%2F..',
    'https://www.linkedin.com/company/x',
    'https://bit.ly/abc',
    'https://lnkd.in/abc',
    'mailto:autre@example.com',
    '/autre/chemin.pdf',
    '/cv/missing.pdf',
    'javascript:alert(1)',
  ])('refuses %s', (href) => {
    expect(linkProblem(href, testRules)).not.toBeNull();
  });

  it('fails clearly while GITHUB_ACCOUNT is empty', () => {
    const rules = { ...testRules, githubAccount: '' };
    expect(linkProblem('https://github.com/x/y', rules)).toContain('GITHUB_ACCOUNT');
  });

  it('allows a declared extra repository only, not the rest of its owner', () => {
    expect(linkProblem('https://github.com/autre/projet', testRules)).toBeNull();
    expect(linkProblem('https://github.com/autre/projet-bis', testRules)).not.toBeNull();
    expect(linkProblem('https://github.com/autre', testRules)).not.toBeNull();
  });

  it('allows a declared demo host only', () => {
    const rules = { ...testRules, demoHosts: ['demo.example.com'] };
    expect(linkProblem('https://demo.example.com/app', rules)).toBeNull();
    expect(linkProblem('https://other.example.com/app', rules)).not.toBeNull();
  });
});
