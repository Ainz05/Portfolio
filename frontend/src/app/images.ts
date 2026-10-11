import { indexImageUrls } from '@/lib/images';

/*
 * Real images (your photo, the project screenshots).
 *
 * 1. Put the files in frontend/src/assets/images/. The build hashes them and serves them from
 *    /assets/, on the same origin (compatible with the strict CSP).
 * 2. Declare them in data/ with { file: 'name.webp', alt: '…', width: 800, height: 800 }:
 *    `photo` in data/hero.ts, `screenshot` on each project in data/projects.ts.
 * 3. Formats: WebP or AVIF, or an optimized JPEG; a reasonable size (about 1600 px wide at most
 *    for a screenshot, 800 px for the photo). SVG is refused.
 * 4. Only put final files there, already cleaned: remove the EXIF/GPS metadata before adding a
 *    photo (it can contain your location), for example with `exiftool -all= <file>`. The tests
 *    refuse metadata, files over 400 KB (photo) or 600 KB (screenshot), and any file that is
 *    not declared in data/ (an unused file could ship private content).
 * 5. Write a useful alt text: say what the image shows, without starting with "image of".
 *
 * Until a file is declared, a placeholder is shown. A declared name that does not exist, or an
 * unsafe name, makes a test fail instead of breaking the page.
 */
const modules = import.meta.glob<string>('../assets/images/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const imageUrls = indexImageUrls(modules);
