import { navigation } from '@/data/navigation';
import { siteTitle } from '@/data/site';
import { Header } from '@/sections/Header';
import styles from './App.module.css';

// Target of the skip link; sections will be added inside <main>.
const MAIN_ID = 'contenu';

export default function App() {
  return (
    <>
      <Header
        logo={navigation.logo}
        navLabel={navigation.ariaLabel}
        skipLinkLabel={navigation.skipLinkLabel}
        skipLinkHref={`#${MAIN_ID}`}
        items={navigation.items}
      />
      <main id={MAIN_ID} tabIndex={-1} className={styles.main}>
        <h1>{siteTitle}</h1>
      </main>
    </>
  );
}
