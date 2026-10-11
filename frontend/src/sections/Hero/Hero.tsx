import type { HeroContent } from '@/types/sections';
import { Heading } from '@/ui/Heading';
import { ImagePlaceholder } from '@/ui/ImagePlaceholder';
import { Link } from '@/ui/Link';
import { Section } from '@/ui/Section';
import styles from './Hero.module.css';

export interface HeroProps {
  readonly content: HeroContent;
}

interface HeroTitleProps {
  readonly content: HeroContent;
  readonly id: string;
}

function HeroTitle({ content, id }: HeroTitleProps) {
  return (
    <Heading level={1} id={id}>
      {content.titleBefore}
      {/* A plain span: the highlight is decoration, and <mark> would be announced by
          screen readers as a relevance mark. */}
      <span className={styles.highlight}>{content.titleHighlight}</span>
      {content.titleAfter}
    </Heading>
  );
}

export function Hero({ content }: HeroProps) {
  const titleId = `${content.id}-titre`;
  return (
    <Section id={content.id} titleId={titleId} tone="light">
      <div className={styles.layout}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <HeroTitle content={content} id={titleId} />
          <p className={styles.paragraph}>{content.paragraph}</p>
          <div className={styles.actions}>
            <Link href={content.primaryAction.href} variant="primary">
              {content.primaryAction.label}
            </Link>
            <Link href={content.secondaryAction.href} variant="secondary">
              {content.secondaryAction.label}
            </Link>
          </div>
        </div>
        <div className={styles.photo}>
          <ImagePlaceholder label={content.photoPlaceholder} tone="accent" />
        </div>
      </div>
    </Section>
  );
}
