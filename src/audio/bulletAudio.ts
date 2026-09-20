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
   * Unique Cinematic 3D Globe Quantum Prismatic Detonation Sound
   * Gravitational implosion suck -> supersonic seismic detonation -> 4-tone crystalline glass shimmer
   */
  public playUniqueGlobeBlast() {
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Gravitational Implosion Riser (Reverse frequency surge: 60Hz -> 240Hz in 140ms)
    const implosionOsc = ctx.createOscillator();
    const implosionGain = ctx.createGain();
    implosionOsc.type = 'sine';
    implosionOsc.frequency.setValueAtTime(55, now);
    implosionOsc.frequency.exponentialRampToValueAtTime(260, now + 0.14);

    implosionGain.gain.setValueAtTime(0.01, now);
    implosionGain.gain.linearRampToValueAtTime(0.35, now + 0.13);
    implosionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    implosionOsc.connect(implosionGain);
    implosionGain.connect(ctx.destination);
    implosionOsc.start(now);
    implosionOsc.stop(now + 0.16);

    // 2. Heavy Sub-Bass Cosmic Impact Body (Detonation at +0.14s: 160Hz -> 24Hz)
    const detonateTime = now + 0.14;
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, detonateTime);
    subOsc.frequency.exponentialRampToValueAtTime(24, detonateTime + 0.75);

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(260, detonateTime);
    subFilter.frequency.exponentialRampToValueAtTime(50, detonateTime + 0.8);

    subGain.gain.setValueAtTime(0.85, detonateTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, detonateTime + 0.85);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(detonateTime);
    subOsc.stop(detonateTime + 0.9);

    // 3. High-Energy Plasma Shockwave Transient (Filtered noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2800, detonateTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(320, detonateTime + 0.2);
    noiseFilter.Q.setValueAtTime(2.2, detonateTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.55, detonateTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, detonateTime + 0.22);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(detonateTime);
    noiseSource.stop(detonateTime + 0.24);

    // 4. Shimmering Crystalline Prismatic Harmonic Chimes (Ethereal shattered diamond resonance)
    const chordFrequencies = [880, 1318, 1760, 2637];
    chordFrequencies.forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, detonateTime + 0.02);
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 0.97, detonateTime + 0.7);

      chimeGain.gain.setValueAtTime(0.16 / (idx + 1), detonateTime + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, detonateTime + 0.75);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chimeOsc.start(detonateTime + 0.02);
      chimeOsc.stop(detonateTime + 0.8);
    });
  }

  /**
   * Play an ethereal, celestial harmonic chord when Human and AI clasp hands.
   * Fuses warm organic golden resonance (A3-E4-C#5) with crystalline cyan brilliance (G#5-C#6).
   */
  public playHandshakeChord() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const chordFrequencies = [220, 329.63, 440, 554.37, 659.25, 830.61, 1108.73];

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx < 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle micro-chorus vibrato
      osc.frequency.exponentialRampToValueAtTime(freq * 1.002, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 1.2);

      const amp = 0.08 / (1 + idx * 0.4);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.9);
    });
  }

  /**
   * Play a pristine, crystalline glass chime for each letter revealed in M-A-N-T-I-F
   */
  public playLetterReveal(index: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const scale = [523.25, 659.25, 783.99, 880.0, 1046.5, 1318.51];
    const freq = scale[index % scale.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Subtle soft click on interactive hover
   */
  public playHoverTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.025);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export const bulletAudio = new BulletSoundEngine();
