import type { ImageRef, ImageSource } from '@/types/image';
import { sanitizeInternalHref } from './internalHref';

/** File name (without folder) to the URL produced by the build. */
export type ImageUrls = Readonly<Record<string, string>>;

// A bare file name with a raster extension: no folder, no "..", no SVG (it can carry scripts).
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:webp|avif|jpe?g|png)$/i;

/** Indexes glob results (`../assets/images/x.webp` to its URL) by file name. */
export function indexImageUrls(modules: Readonly<Record<string, string>>): ImageUrls {
  return Object.fromEntries(
    Object.entries(modules).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1), url]),
  );
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Turns a declared image into a renderable one, or `null` (the caller then shows the
 * placeholder) when the file is unknown, the name is unsafe, the alternative text is blank or
 * the size is invalid. The URL is only ever taken from the build output, never from `data/`.
 */
export function resolveImage(ref: ImageRef | undefined, urls: ImageUrls): ImageSource | null {
  if (ref === undefined || !FILE_NAME.test(ref.file) || ref.file.includes('..')) {
    return null;
  }
  const url = Object.hasOwn(urls, ref.file) ? urls[ref.file] : undefined;
  const valid =
    url !== undefined &&
    sanitizeInternalHref(url) !== null &&
    ref.alt.trim() !== '' &&
    isPositiveInteger(ref.width) &&
    isPositiveInteger(ref.height);
  return valid ? { src: url, alt: ref.alt, width: ref.width, height: ref.height } : null;
}
