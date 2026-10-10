import { about } from '@/data/about';
import { contact } from '@/data/contact';
import { hero } from '@/data/hero';
import { navigation } from '@/data/navigation';
import { projects } from '@/data/projects';
import { contactEmail, contactSubject } from '@/data/site';
import { skills } from '@/data/skills';
import { sanitizeInternalHref } from '@/lib/internalHref';
import { buildMailto } from '@/lib/mailto';
import { sanitizeUrl } from '@/lib/url';

const PLACEHOLDER = /^\[À COMPLÉTER : [^\]]+\]$/;
// Placeholder forms imposed verbatim by SPEC.md.
const SPEC_PLACEHOLDERS = ['[Ta photo ici]', "[Capture d'écran du projet]"];

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

const allStrings = collectStrings([navigation, hero, projects, skills, about, contact]);

const allHrefs = [
  ...navigation.items,
  hero.primaryAction,
  hero.secondaryAction,
  ...projects.projects.flatMap((project) => project.links),
  ...contact.socialLinks,
].map((link) => link.href);

describe('site content', () => {
  it('has unique section ids matching the navigation anchors', () => {
    const ids = [projects.id, skills.id, about.id, contact.id];
    expect(new Set(ids).size).toBe(ids.length);
    expect(navigation.items.map((item) => item.href)).toEqual(ids.map((id) => `#${id}`));
  });

  it('has unique project and skill ids', () => {
    const ids = [...projects.projects.map((p) => p.id), ...skills.columns.map((c) => c.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(allHrefs)('has a valid link or a placeholder for %j', (href) => {
    const valid = sanitizeUrl(href) !== null || sanitizeInternalHref(href) !== null;
    expect(valid || PLACEHOLDER.test(href)).toBe(true);
  });

  it('writes every bracketed placeholder in an accepted form', () => {
    const bracketed = allStrings.flatMap((text) => text.match(/\[[^\]]*\]/g) ?? []);
    for (const placeholder of bracketed) {
      expect(PLACEHOLDER.test(placeholder) || SPEC_PLACEHOLDERS.includes(placeholder)).toBe(true);
    }
  });

  it('builds a safe mailto from the configured subject', () => {
    expect(buildMailto({ to: 'prenom@example.com', subject: contactSubject })).not.toBeNull();
  });

  it('shows the email placeholder as text until a real address is set', () => {
    expect(buildMailto({ to: contactEmail, subject: contactSubject })).toBeNull();
    expect(contact.emailLabel).toBe(contactEmail);
  });
});
