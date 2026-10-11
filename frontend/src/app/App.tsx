import { hero } from '@/data/hero';
import { navigation } from '@/data/navigation';
import { projects } from '@/data/projects';
import { newTabLabel } from '@/data/site';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Projects } from '@/sections/Projects';
import styles from './App.module.css';

// Target of the skip link; further sections are added inside <main>.
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
        <Hero content={hero} />
        <Projects content={projects} newTabLabel={newTabLabel} />
      </main>
    </>
  );
}
