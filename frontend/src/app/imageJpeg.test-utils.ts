import { ascii, view } from './imageBytes.test-utils';

const XMP_PREFIX = 'http://ns.adobe.com/';
const SOS = 0xda;
const EOI = 0xd9;

// APP1 carries EXIF or XMP (also extended XMP), APP2 the MPF index, APP11 JUMBF/C2PA,
// APP13 Photoshop/IPTC, and COM free text.
function segmentProblem(marker: number, start: string): string | null {
  if (marker === 0xe1 && (start.startsWith('Exif\0\0') || start.startsWith(XMP_PREFIX))) {
    return 'JPEG EXIF or XMP segment';
  }
  if (marker === 0xe2 && start.startsWith('MPF\0')) {
    return 'JPEG MPF segment';
  }
  return [0xeb, 0xed, 0xfe].includes(marker) ? 'JPEG JUMBF, IPTC or comment segment' : null;
}

// After the scan, the first FF D9 is the end of the image (inside entropy-coded data every FF
// is followed by 00 or a restart marker). Only zero padding may follow it.
function trailerProblem(bytes: Uint8Array, scanStart: number): string | null {
  const data = view(bytes);
  for (let offset = scanStart; offset + 1 < bytes.length; offset += 1) {
    if (data.getUint8(offset) === 0xff && data.getUint8(offset + 1) === EOI) {
      const trailer = bytes.subarray(offset + 2);
      return trailer.every((byte) => byte === 0) ? null : 'JPEG data after the end of image';
    }
  }
  return 'malformed JPEG: no end of image';
}

export function jpegProblem(bytes: Uint8Array): string | null {
  const data = view(bytes);
  let offset = 2;
  while (offset + 1 < bytes.length) {
    if (data.getUint8(offset) !== 0xff) {
      return 'malformed JPEG: marker expected';
    }
    const marker = data.getUint8(offset + 1);
    if (marker === 0xff) {
      offset += 1; // fill byte before a marker
      continue;
    }
    if (offset + 4 > bytes.length) {
      return 'malformed JPEG: truncated segment';
    }
    const length = data.getUint16(offset + 2);
    if (marker === EOI || length < 2 || offset + 2 + length > bytes.length) {
      return 'malformed JPEG: bad segment';
    }
    const problem = segmentProblem(marker, ascii(bytes, offset + 4, Math.min(length - 2, 40)));
    if (problem !== null) {
      return problem;
    }
    offset += 2 + length;
    if (marker === SOS) {
      return trailerProblem(bytes, offset);
    }
  }
  return 'malformed JPEG: no scan';
}
