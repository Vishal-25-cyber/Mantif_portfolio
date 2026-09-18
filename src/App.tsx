import React, { useState, useEffect } from 'react';
import { useLenis } from './hooks/useLenis';

import { Navbar } from './components/Navbar';
import { GrainOverlay } from './components/GrainOverlay';
import { MarqueeStrip } from './components/MarqueeStrip';
import { IntroSection } from './sections/IntroSection';
import { ServicesSection } from './sections/ServicesSection';
import { PeopleSection } from './sections/PeopleSection';
import { JourneySection } from './sections/JourneySection';
import { PhilosophySection } from './sections/PhilosophySection';
import { FooterSection } from './sections/FooterSection';

export function App() {
  // Track if the animated intro sequence is currently active/playing.
  // ALWAYS starts true so the navbar is STRICTLY hidden while animation is running.
  const [isIntroActive, setIsIntroActive] = useState(true);

  // Freeze smooth scroll & wheel while intro is active to prevent bottom layer from peeking
  useLenis(isIntroActive);

  useEffect(() => {
    // When intro is active on mount, ensure page stays pinned at the very top
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      // Clear any lingering section hash so it doesn't conflict with intro playback
      if (window.location.hash && window.location.hash !== '#intro') {
        try {
          history.replaceState(null, '', window.location.pathname);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // While the intro animation is playing, navbar is strictly hidden.
  // The moment intro completes (or is skipped), the navbar emerges smoothly.
  const hideNavbar = isIntroActive;

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#002137] overflow-x-hidden selection:bg-[#004B79] selection:text-[#FAF8F5]">
      {/* Cinematic Animated Film Grain Overlay */}
      <GrainOverlay />

      <Navbar hidden={hideNavbar} />

      <main className="relative flex flex-col w-full">
        {/* Page 1: The Human × AI Introduction */}
        <IntroSection onIntroComplete={() => setIsIntroActive(false)} />

        {/* Luxury editorial marquee separator */}
        <MarqueeStrip />

        {/* Page 2: What MANTIF Builds */}
        <ServicesSection />

        {/* Dark marquee separator (reversed) */}
        <MarqueeStrip dark reverse />

        {/* Page 3: The People Behind MANTIF */}
        <PeopleSection />

        {/* Light marquee separator */}
        <MarqueeStrip />

        {/* Page 4: The MANTIF Journey — DARK CINEMATIC SECTION */}
        <JourneySection />

        {/* Page 5: The Philosophy */}
        <PhilosophySection />

        {/* Final Footer */}
        <FooterSection />
      </main>
    </div>
  );
}

export default App;
