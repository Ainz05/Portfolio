/** Image as declared in data/: a file name inside src/assets/images/ (see app/images.ts). */
export interface ImageRef {
  readonly file: string;
  /** Text alternative, written by hand: what the image shows, not "image of…". */
  readonly alt: string;
  /** Intrinsic size in pixels, so the browser reserves the space (no layout shift). */
  readonly width: number;
  readonly height: number;
}

/** Image ready to render: `src` is a local URL produced by the build. */
export interface ImageSource {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}
