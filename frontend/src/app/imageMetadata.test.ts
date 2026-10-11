import { metadataProblem } from './imageMetadata.test-utils';
import {
  avif,
  bytes,
  jpeg,
  jpegSegment,
  png,
  pngChunk,
  text,
  webp,
} from './imageSamples.test-utils';

const JFIF = [jpegSegment(0xe0, 'JFIF\0')];

describe('clean images pass', () => {
  it.each([
    ['PNG', png(['IDAT'])],
    ['JPEG', jpeg({ segments: JFIF })],
    ['JPEG with zero padding after the end of image', jpeg({ segments: JFIF, afterEnd: [0, 0] })],
    ['WebP', webp('VP8 ')],
    ['AVIF', avif('avif', 'mdat')],
    ['AVIF sequence', avif('avis', 'mdat')],
  ])('%s', (_label, data) => {
    expect(metadataProblem(data)).toBeNull();
  });
});

describe('metadata and malformed images are refused', () => {
  it.each([
    ['PNG eXIf chunk', png(['eXIf']), 'PNG chunk eXIf'],
    ['PNG tEXt chunk', png(['tEXt']), 'PNG chunk tEXt'],
    ['PNG iTXt chunk', png(['iTXt']), 'PNG chunk iTXt'],
    ['PNG zTXt chunk', png(['zTXt']), 'PNG chunk zTXt'],
    ['PNG caBX (C2PA) chunk', png(['caBX']), 'PNG chunk caBX'],
    ['PNG without IEND', png(['IDAT'], false), 'no IEND'],
    [
      'PNG with an inconsistent length, then tEXt',
      bytes([...png(['IDAT'], false), ...pngChunk('IDAT', 0xffffff00), ...pngChunk('tEXt')]),
      'malformed PNG',
    ],
    [
      'JPEG EXIF after fill bytes',
      jpeg({ before: [0xff, 0xff, 0xff], segments: [jpegSegment(0xe1, 'Exif\0\0II*')] }),
      'EXIF or XMP',
    ],
    [
      'JPEG XMP',
      jpeg({ segments: [jpegSegment(0xe1, 'http://ns.adobe.com/xap/1.0/\0')] }),
      'EXIF or XMP',
    ],
    [
      'JPEG extended XMP',
      jpeg({ segments: [jpegSegment(0xe1, 'http://ns.adobe.com/xmp/extension/\0')] }),
      'EXIF or XMP',
    ],
    ['JPEG MPF', jpeg({ segments: [jpegSegment(0xe2, 'MPF\0')] }), 'MPF'],
    ['JPEG JUMBF (C2PA)', jpeg({ segments: [jpegSegment(0xeb, 'JP\0\0jumb')] }), 'JUMBF'],
    ['JPEG IPTC', jpeg({ segments: [jpegSegment(0xed, 'Photoshop 3.0\0')] }), 'IPTC'],
    ['JPEG without scan', jpeg({ segments: JFIF, withScan: false }), 'malformed JPEG'],
    [
      'JPEG with data after the end of image',
      jpeg({ segments: JFIF, afterEnd: [0xff, 0xd8, ...text('Exif\0\0GPS')] }),
      'after the end',
    ],
    ['WebP EXIF chunk', webp('EXIF'), 'WebP chunk EXIF'],
    ['WebP XMP chunk', webp('XMP '), 'WebP chunk XMP'],
    ['WebP C2PA chunk', webp('C2PA'), 'WebP chunk C2PA'],
    ['WebP with an inconsistent RIFF size', webp('VP8 ', 10), 'inconsistent RIFF'],
    ['AVIF Exif item', avif('avif', 'infe Exif'), 'AVIF EXIF or XMP'],
    ['AVIF XMP item', avif('avif', 'application/rdf+xml'), 'AVIF EXIF or XMP'],
    [
      'AVIF XMP without the xap namespace',
      avif('avif', 'adobe:ns:meta exif:GPSLatitude'),
      'forbidden signature',
    ],
    ['HEIC renamed to .avif', avif('heic', 'mdat'), 'not an AVIF'],
    ['unknown bytes', bytes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), 'unrecognized'],
  ])('%s', (_label, data, fragment) => {
    expect(metadataProblem(data)).toContain(fragment);
  });
});
