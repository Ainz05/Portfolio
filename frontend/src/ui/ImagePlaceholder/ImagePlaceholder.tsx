import styles from './ImagePlaceholder.module.css';

export type ImagePlaceholderTone = 'neutral' | 'accent';

export interface ImagePlaceholderProps {
  /** Visible placeholder text, also the accessible name (e.g. "[À COMPLÉTER : …]"). */
  readonly label: string;
  /** `neutral`: dashed screenshot block. `accent`: yellow portrait block. */
  readonly tone?: ImagePlaceholderTone;
}

// role="img" with the visible label as its name: the missing picture stays announced,
// and its inner text is not read twice.
export function ImagePlaceholder({ label, tone = 'neutral' }: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`${styles.placeholder ?? ''} ${styles[tone] ?? ''}`}
    >
      <span aria-hidden="true">{label}</span>
    </div>
  );
}
