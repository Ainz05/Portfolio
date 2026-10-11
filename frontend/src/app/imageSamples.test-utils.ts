// Tiny in-memory images for the metadata detection tests (no binary file is committed).
// Not imported by the application.

export function text(value: string): number[] {
  return Array.from(value, (char) => char.charCodeAt(0));
}

function u32(value: number, littleEndian = false): number[] {
  const parts = [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  return littleEndian ? parts.reverse() : parts;
}

export function bytes(values: readonly number[]): Uint8Array {
  return Uint8Array.from(values);
}

// PNG

const PNG_SIGNATURE = [0x89, ...text('PNG'), 0x0d, 0x0a, 0x1a, 0x0a];

export function pngChunk(type: string, length = 0): number[] {
  return [...u32(length), ...text(type), ...u32(0)];
}

/** A PNG made of an IHDR, the given chunk types, then IEND (unless `withEnd` is false). */
export function png(chunkTypes: readonly string[], withEnd = true): Uint8Array {
  const chunks = ['IHDR', ...chunkTypes, ...(withEnd ? ['IEND'] : [])];
  return bytes([...PNG_SIGNATURE, ...chunks.flatMap((type) => pngChunk(type))]);
}

// JPEG

export function jpegSegment(marker: number, payload: string): number[] {
  const body = text(payload);
  const length = body.length + 2;
  return [0xff, marker, length >> 8, length & 255, ...body];
}

interface JpegParts {
  readonly before?: readonly number[];
  readonly segments: readonly (readonly number[])[];
  readonly afterEnd?: readonly number[];
  readonly withScan?: boolean;
}

export function jpeg({ before = [], segments, afterEnd = [], withScan = true }: JpegParts) {
  const scan = withScan ? [...jpegSegment(0xda, '\0'), 0x12, 0x34, 0xff, 0xd9] : [];
  return bytes([0xff, 0xd8, ...before, ...segments.flat(), ...scan, ...afterEnd]);
}

// WebP

/** A WebP with one chunk; `riffSizeDelta` makes the RIFF size inconsistent on purpose. */
export function webp(chunkType: string, riffSizeDelta = 0): Uint8Array {
  const chunk = [...text(chunkType), ...u32(2, true), 0, 0];
  const size = 4 + chunk.length + riffSizeDelta;
  return bytes([...text('RIFF'), ...u32(size, true), ...text('WEBP'), ...chunk]);
}

// AVIF

export function avif(brand: string, content: string): Uint8Array {
  return bytes([...u32(24), ...text(`ftyp${brand}`), ...text(content)]);
}
