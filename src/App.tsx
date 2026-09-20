import React, { useState, useEffect, useRef } from 'react';
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

// ── Background Music ─────────────────────────────────────────────────────────
// 3-step autoplay strategy so the song starts as early as the browser allows:
//   1. Try immediate unmuted play → fade in
//   2. Try muted autoplay (almost always allowed) → unmute on first gesture
//   3. Full fallback → play on very first user interaction
function useBgMusic(src: string): React.MutableRefObject<(() => void) | null> {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const started = useRef(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    // Smooth fade-out over ~1.2 s
    stopRef.current = () => {
      const step = (audio.volume || 0.45) / 24;
      const fade = setInterval(() => {
        if (audio.volume > step) {
          audio.volume = Math.max(0, audio.volume - step);
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fade);
        }
      }, 50);
    };

    // Smooth fade-in from 0 → target over ~1.5 s
    const fadeIn = (target = 0.45) => {
      audio.volume = 0;
      let v = 0;
      const step = target / 30;
      const timer = setInterval(() => {
        v = Math.min(v + step, target);
        audio.volume = v;
        if (v >= target) clearInterval(timer);
      }, 50);
    };

    // Called when we need to unmute/start the audio via user gesture
    const unlock = () => {
      if (started.current) return;
      started.current = true;
      if (audio.muted) {
        // Was muted-autoplaying — just unmute and fade in
        audio.muted = false;
        fadeIn();
      } else {
        audio.play().then(() => fadeIn()).catch(() => {});
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('scroll', unlock, true);
      window.removeEventListener('keydown', unlock);
    };

    // ── Step 1: Try direct unmuted autoplay ──────────────────────────────────
    audio.volume = 0;
    audio.muted = false;
    audio
      .play()
      .then(() => {
        // Browser allowed it — mark started and fade in
        started.current = true;
        fadeIn();
      })
      .catch(() => {
        // ── Step 2: Try muted autoplay (nearly always succeeds) ────────────
        audio.muted = true;
        audio.volume = 0.45;
        audio
          .play()
          .then(() => {
            // Playing muted — unmute the moment the user touches anything
            window.addEventListener('click', unlock, { once: true });
            window.addEventListener('touchstart', unlock, { once: true, passive: true });
            window.addEventListener('scroll', unlock, { once: true, passive: true, capture: true });
            window.addEventListener('keydown', unlock, { once: true });
          })
          .catch(() => {
            // ── Step 3: Full gesture fallback ────────────────────────────
            audio.muted = false;
            audio.volume = 0;
            window.addEventListener('click', unlock, { once: true });
            window.addEventListener('touchstart', unlock, { once: true, passive: true });
            window.addEventListener('scroll', unlock, { once: true, passive: true, capture: true });
            window.addEventListener('keydown', unlock, { once: true });
          });
      });

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('scroll', unlock, true);
      window.removeEventListener('keydown', unlock);
    };
  }, [src]);

  return stopRef;
}


export function App() {
  // Track if the animated intro sequence is currently active/playing.
  // ALWAYS starts true on refresh so the user experiences the crisp intro first.
  const [isIntroActive, setIsIntroActive] = useState(true);
  const targetSectionRef = useRef<string | null>(null);

  // Auto-play Tamil mass BGM (Leo movie) — stops when intro ends
  const stopBgMusic = useBgMusic('/audio/tamil_mass_bgm.mp3');

  // Freeze smooth scroll & wheel while intro is active to prevent bottom layer from peeking
  useLenis(isIntroActive);

  // On mount/refresh: capture which section the user was previously viewing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);

      // 1. Check if there was an explicit section hash in URL (e.g. #journey, #people)
      const currentHash = window.location.hash.replace('#', '');
      
      // 2. Or check sessionStorage for the last section the user was exploring
      let savedSection = '';
      try {
        savedSection = sessionStorage.getItem('mantif_last_active_section') || '';
      } catch {
        // ignore
      }

      const target =
        currentHash && currentHash !== 'intro'
          ? currentHash
          : savedSection && savedSection !== 'intro'
          ? savedSection
          : null;

      if (target) {
        targetSectionRef.current = target;
      }
    }
  }, []);

  // Track active section as user scrolls so refresh always remembers where they were
  useEffect(() => {
    if (isIntroActive) return;

    const sections = ['intro', 'services', 'people', 'journey', 'philosophy', 'contact'];
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY < 250) {
            try {
              sessionStorage.setItem('mantif_last_active_section', 'intro');
              if (window.location.hash && window.location.hash !== '#intro') {
                history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            } catch {
              // ignore
            }
            ticking = false;
            return;
          }

          const focalY = window.innerHeight * 0.45;
          for (let i = sections.length - 1; i >= 0; i--) {
            const sId = sections[i];
            const el = document.getElementById(sId);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= focalY && rect.bottom >= focalY) {
                try {
                  sessionStorage.setItem('mantif_last_active_section', sId);
                  if (window.location.hash !== '#' + sId) {
                    history.replaceState(null, '', '#' + sId);
                  }
                } catch {
                  // ignore
                }
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isIntroActive]);

  // When intro completes (at normal speed or when skipped), launch into their respective section
  const handleIntroComplete = () => {
    // Fade out the intro BGM
    stopBgMusic.current?.();
    setIsIntroActive(false);

    const target = targetSectionRef.current;
    if (target && target !== 'intro') {
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          const lenis = (window as any).__lenis;
          if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(el, { duration: 0.6 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          try {
            history.replaceState(null, '', '#' + target);
          } catch {
            // ignore
          }
        }
      }, 70);
    }
  };

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
        <IntroSection onIntroComplete={handleIntroComplete} />

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
