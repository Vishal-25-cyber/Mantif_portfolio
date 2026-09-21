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
   * Cinematic Web Audio Bullet Impact Synthesizer
   * Synthesizes sharp, punchy bullet strike sounds on each character reveal.
   */
  public playBulletImpact(index: number = 0, isFinal: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const pitchJitter = (index % 5) * 25;

    // 1. Sharp Transient Strike (Mechanical Snap: 2200Hz -> 280Hz in 18ms)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(2200 + pitchJitter, now);
    snapOsc.frequency.exponentialRampToValueAtTime(280, now + 0.018);

    snapGain.gain.setValueAtTime(isFinal ? 0.35 : 0.22, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.025);

    // 2. Punchy Sub-Bass Impact (Low Thump)
    const thumOsc = ctx.createOscillator();
    const thumGain = ctx.createGain();
    thumOsc.type = 'sine';
    thumOsc.frequency.setValueAtTime(isFinal ? 240 : 160, now);
    thumOsc.frequency.exponentialRampToValueAtTime(40, now + (isFinal ? 0.08 : 0.04));

    thumGain.gain.setValueAtTime(isFinal ? 0.45 : 0.28, now);
    thumGain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.09 : 0.045));

    thumOsc.connect(thumGain);
    thumGain.connect(ctx.destination);
    thumOsc.start(now);
    thumOsc.stop(now + 0.1);

    // 3. Metallic Snap Noise Burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.025);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2800 + pitchJitter * 2, now);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(isFinal ? 0.25 : 0.14, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.03);
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

  /**
   * Mechanical Torch switch click & optical burst whoosh
   */
  public playTorchFlash() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Mechanical switch click
    const oscClick = ctx.createOscillator();
    const gainClick = ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(2400, now);
    oscClick.frequency.exponentialRampToValueAtTime(320, now + 0.04);
    gainClick.gain.setValueAtTime(0.18, now);
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    oscClick.connect(gainClick);
    gainClick.connect(ctx.destination);
    oscClick.start(now);
    oscClick.stop(now + 0.05);

    // 2. Optical flare surge whoosh
    const bufferSize = Math.floor(ctx.sampleRate * 0.25);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    filter.Q.setValueAtTime(2.5, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.25);
  }
}

export const bulletAudio = new BulletSoundEngine();
