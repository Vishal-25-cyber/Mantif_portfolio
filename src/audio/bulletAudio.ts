/**
 * Cinematic Web Audio Bullet Impact Synthesizer for MANTIF
 * Synthesizes sharp, punchy bullet strike sounds on each character reveal.
 */

class BulletSoundEngine {
  private ctx: AudioContext | null = null;

  constructor() {
    this.setupUnlockListeners();
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('scroll', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('scroll', unlock, { passive: true });
  }

  public unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  /**
   * Play a sharp, punchy bullet impact sound
   * @param index Letter index (1..23) for slight organic pitch variation
   * @param isFinal True for the final '?' mark, adding metallic ricochet resonance
   */
  public playBulletImpact(index: number = 0, isFinal: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Supersonic Crack / Snap (Noise burst through bandpass filter)
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    const jitter = ((index * 79) % 30) - 15;
    bandpass.frequency.setValueAtTime(3200 + jitter * 20, now);
    bandpass.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    whiteNoise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.04);

    // 2. Heavy Bullet Body Punch (Triangle wave pitch drop)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = 360 + jitter * 5;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.055);

    oscGain.gain.setValueAtTime(0.48, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);

    // 3. Final '?' Impact: Metallic Ricochet Ring
    if (isFinal) {
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();

      metalOsc.type = 'sine';
      metalOsc.frequency.setValueAtTime(1450, now);
      metalOsc.frequency.exponentialRampToValueAtTime(820, now + 0.28);

      metalGain.gain.setValueAtTime(0.25, now);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);

      metalOsc.start(now + 0.01);
      metalOsc.stop(now + 0.34);
    }
  }

  /**
   * Unique Cinematic 3D Globe Supernova Detonation Sound
   * Deep sub-bass implosion sweep -> supersonic plasma snap -> crystalline reverberation
   */
  public playUniqueGlobeBlast() {
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Sub-Bass Cosmic Impact Body (135Hz -> 28Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(135, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.65);

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(220, now);
    subFilter.frequency.exponentialRampToValueAtTime(60, now + 0.7);

    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.8);

    // 2. High-Energy Plasma Shockwave (Filtered noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1900, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(450, now + 0.16);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.2);

    // 3. Shimmering Golden Chime Tail
    [1100, 1760].forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.05);
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.6);

      chimeGain.gain.setValueAtTime(0.12 / (idx + 1), now + 0.05);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chimeOsc.start(now + 0.05);
      chimeOsc.stop(now + 0.7);
    });
  }
}

export const bulletAudio = new BulletSoundEngine();
