/**
 * High-Performance Image Preloader & GPU-Decoder Service for MANTIF Portfolio
 *
 * Ensures all critical photographic & cutout assets are fetched, cached, and
 * asynchronously decoded into GPU memory BEFORE they enter the viewport or carousel.
 */

const preloadedCache = new Set<string>();

/**
 * Preload and decode a single image asynchronously
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (preloadedCache.has(src)) {
    // Return early if already preloaded
    const img = new Image();
    img.src = src;
    return Promise.resolve(img);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    
    img.onload = async () => {
      preloadedCache.add(src);
      try {
        if ('decode' in img) {
          await img.decode();
        }
      } catch {
        // Decode errors on older engines shouldn't fail the promise
      }
      resolve(img);
    };

    img.onerror = () => {
      // Fallback: don't permanently break pipeline on single asset error
      resolve(img);
    };

    img.src = src;
  });
}

/**
 * Preload a collection of images concurrently
 */
export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map((src) => preloadImage(src)));
}

/**
 * Critical images needed for the initial viewport and PeopleSection carousel
 */
export const CRITICAL_IMAGES = [
  '/images/founder_karunya_clean.webp',
  '/images/team_vishal_clean.webp',
  '/images/team_solairaj_clean.webp',
  '/images/mantif_icon.webp',
  '/images/mantif_logo.webp',
];

/**
 * Secondary images needed for galleries, journey milestones, and modals
 */
export const SECONDARY_IMAGES = [
  '/images/gallery_1.webp',
  '/images/gallery_2.webp',
  '/images/gallery_3.webp',
  '/images/gallery_4.webp',
  '/images/gallery_5.webp',
  '/images/gallery_6.webp',
  '/images/gallery_7.webp',
  '/images/ai_seminar_banner.webp',
];

/**
 * Kick off background preloading of critical assets
 */
export function initAssetPreloading(): void {
  if (typeof window === 'undefined') return;

  // 1. Immediately preload top critical images
  preloadImages(CRITICAL_IMAGES).then(() => {
    // 2. Idle-preload secondary images when main thread is quiet
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        preloadImages(SECONDARY_IMAGES);
      });
    } else {
      setTimeout(() => {
        preloadImages(SECONDARY_IMAGES);
      }, 1500);
    }
  });
}
