import type { ImageSource } from '@/types/image';
import { ImagePlaceholder } from '@/ui/ImagePlaceholder';
import styles from './Picture.module.css';

export type PictureTone = 'neutral' | 'accent';

export interface PictureProps {
  /** Image to show, or `null` to show the placeholder instead. */
  readonly image: ImageSource | null;
  /** Placeholder text, also its accessible name. */
  readonly placeholder: string;
  readonly tone?: PictureTone;
  /** Above the fold (hero): loaded right away instead of lazily. */
  readonly priority?: boolean;
}

// The src only comes from the build (see lib/images.ts), never from content text.
export function Picture({ image, placeholder, tone = 'neutral', priority = false }: PictureProps) {
  if (image === null) {
    return <ImagePlaceholder label={placeholder} tone={tone} />;
  }
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={`${styles.picture ?? ''} ${styles[tone] ?? ''}`}
    />
  );
}
