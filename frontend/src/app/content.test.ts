import * as about from '@/data/about';
import * as contact from '@/data/contact';
import * as navigation from '@/data/navigation';
import * as projects from '@/data/projects';
import * as site from '@/data/site';
import * as skills from '@/data/skills';
import { sanitizeInternalHref } from '@/lib/internalHref';
import { buildMailto } from '@/lib/mailto';
import { sanitizeUrl } from '@/lib/url';

const PLACEHOLDER = /^\[À COMPLÉTER : [^\]]+\]$/;
// Placeholder forms imposed verbatim by SPEC.md.
const SPEC_PLACEHOLDERS = ['[Ta photo ici]', "[Capture d'écran du projet]"];

// Every module of data/ (tests excluded): a new file is covered without editing this test.
const dataModules = import.meta.glob(['../data/*.ts', '!../data/*.test.ts'], { eager: true });
const allData: readonly unknown[] = Object.values(dataModules);

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function collectHrefs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectHrefs);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      key === 'href' && typeof child === 'string' ? [child] : collectHrefs(child),
    );
  }
  return [];
}

function isSafeLink(href: string): boolean {
  return sanitizeUrl(href) !== null || sanitizeInternalHref(href) !== null;
}

const allStrings = collectStrings(allData);
const allHrefs = collectHrefs(allData);

describe('site content', () => {
  it('has unique section ids matching the navigation anchors', () => {
    const ids = [projects.projects.id, skills.skills.id, about.about.id, contact.contact.id];
    expect(new Set(ids).size).toBe(ids.length);
    expect(navigation.navigation.items.map((item) => item.href)).toEqual(ids.map((id) => `#${id}`));
  });

  it('has unique project and skill ids', () => {
    const ids = [
      ...projects.projects.projects.map((project) => project.id),
      ...skills.skills.columns.map((column) => column.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('finds the links of every section', () => {
    expect(allHrefs.length).toBeGreaterThanOrEqual(15);
  });

  it.each(allHrefs)('has a valid link or a placeholder for %j', (href) => {
    expect(isSafeLink(href) || PLACEHOLDER.test(href)).toBe(true);
  });

  it('never lets a placeholder pass link validation', () => {
    const placeholders = allStrings.filter((text) => PLACEHOLDER.test(text));
    expect(placeholders.length).toBeGreaterThan(0);
    for (const placeholder of placeholders) {
      expect(sanitizeUrl(placeholder)).toBeNull();
      expect(sanitizeInternalHref(placeholder)).toBeNull();
    }
  });

  it('writes every bracketed placeholder in an accepted form', () => {
    const bracketed = allStrings.flatMap((text) => text.match(/\[[^\]]*\]/g) ?? []);
    for (const placeholder of bracketed) {
      expect(PLACEHOLDER.test(placeholder) || SPEC_PLACEHOLDERS.includes(placeholder)).toBe(true);
    }
  });

  it('builds a safe mailto from the configured subject', () => {
    expect(buildMailto({ to: 'prenom@example.com', subject: site.contactSubject })).not.toBeNull();
  });

  it('shows the email placeholder as text until a real address is set', () => {
    expect(buildMailto({ to: site.contactEmail, subject: site.contactSubject })).toBeNull();
    expect(contact.contact.emailLabel).toBe(site.contactEmail);
  });
});
