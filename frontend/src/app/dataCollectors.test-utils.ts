import type { ImageRef } from '@/types/image';

// Test helpers: walk every module of data/ without knowing its shape, so new content is
// covered without editing the tests. Not imported by the application.

// Every module of data/ (tests excluded).
const dataModules = import.meta.glob(['../data/*.ts', '!../data/*.test.ts'], { eager: true });
export const allData: readonly unknown[] = Object.values(dataModules);

/** Every string, except the values stored under `skippedKey` (when given). */
export function collectStrings(value: unknown, skippedKey?: string): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((child) => collectStrings(child, skippedKey));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      key === skippedKey ? [] : collectStrings(child, skippedKey),
    );
  }
  return [];
}

/** Every string stored under the given key, at any depth. */
export function collectByKey(value: unknown, wantedKey: string): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((child) => collectByKey(child, wantedKey));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      key === wantedKey && typeof child === 'string' ? [child] : collectByKey(child, wantedKey),
    );
  }
  return [];
}

export function collectHrefs(value: unknown): string[] {
  return collectByKey(value, 'href');
}

function isImageRef(value: unknown): value is ImageRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'file' in value &&
    'alt' in value &&
    'width' in value &&
    'height' in value
  );
}

/** Every image declared in data/ (objects with file, alt, width and height). */
export function collectImageRefs(value: unknown): ImageRef[] {
  if (isImageRef(value)) {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectImageRefs);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectImageRefs);
  }
  return [];
}
