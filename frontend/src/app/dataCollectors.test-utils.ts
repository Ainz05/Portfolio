// Test helpers: walk every module of data/ without knowing its shape, so new content is
// covered without editing the tests. Not imported by the application.

// Every module of data/ (tests excluded).
const dataModules = import.meta.glob(['../data/*.ts', '!../data/*.test.ts'], { eager: true });
export const allData: readonly unknown[] = Object.values(dataModules);

export function collectStrings(value: unknown): string[] {
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

export function collectHrefs(value: unknown): string[] {
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
