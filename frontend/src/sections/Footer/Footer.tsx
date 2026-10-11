import { Container } from '@/ui/Container';
import styles from './Footer.module.css';

export interface FooterProps {
  readonly text: string;
}

export function Footer({ text }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <Container>
        <p>{text}</p>
      </Container>
    </footer>
  );
}
