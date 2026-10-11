import { about } from '@/data/about';
import { hero } from '@/data/hero';
import { navigation } from '@/data/navigation';
import { projects } from '@/data/projects';
import { newTabLabel } from '@/data/site';
import { skills } from '@/data/skills';
import { About } from '@/sections/About';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Projects } from '@/sections/Projects';
import { Skills } from '@/sections/Skills';
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
        <Skills content={skills} />
        <About content={about} />
      </main>
    </>
  );
}
