import { about } from '@/data/about';
import { contact } from '@/data/contact';
import { hero } from '@/data/hero';
import { navigation } from '@/data/navigation';
import { projects } from '@/data/projects';
import { contactEmail, contactSubject, newTabLabel } from '@/data/site';
import { skills } from '@/data/skills';
import { About } from '@/sections/About';
import { Contact } from '@/sections/Contact';
import { Footer } from '@/sections/Footer';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Projects } from '@/sections/Projects';
import { Skills } from '@/sections/Skills';
import styles from './App.module.css';
import { imageUrls } from './images';

// Target of the skip link; the footer is a separate landmark, outside <main>.
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
        <Hero content={hero} imageUrls={imageUrls} />
        <Projects content={projects} newTabLabel={newTabLabel} imageUrls={imageUrls} />
        <Skills content={skills} />
        <About content={about} />
        <Contact
          content={contact}
          email={contactEmail}
          subject={contactSubject}
          newTabLabel={newTabLabel}
        />
      </main>
      <Footer text={contact.footer} />
    </>
  );
}
