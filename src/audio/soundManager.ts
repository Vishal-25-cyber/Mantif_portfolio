/**
 * Minimalist Web Audio API Sound Generator for MANTIF
 * Uses pure procedural synthesis (no external audio files required).
 * Ultra-low latency, zero network dependency, completely opt-in.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false; // Enabled by default as requested
  private masterGain: GainNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private currentTrack: 'leo' | 'master' = 'leo';

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext unavailable
    }
  }

  public unlockAudio() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private initBgm() {
    if (typeof window === 'undefined') return;
    if (!this.bgmAudio) {
      const trackSrc = this.currentTrack === 'leo' ? '/audio/tamil_mass_bgm.mp3' : '/audio/master_mass_bgm.mp3';
      this.bgmAudio = new Audio(trackSrc);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.55;
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.initBgm();

    this.isMuted = !this.isMuted;

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.masterGain) {
        const targetGain = this.isMuted ? 0 : 0.45;
        this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
      }
    }

    if (!this.isMuted) {
      if (this.bgmAudio) {
        this.bgmAudio.volume = 0.55;
        this.bgmAudio.play().catch(() => {
          // Autoplay policy or interaction required
        });
      }
      this.playChime(528, 'sine', 0.5, 0.15);
    } else {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
    }

    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTrackTitle(): string {
    return this.currentTrack === 'leo' ? 'Leo Mass BGM' : 'Master Mass BGM';
  }

  public switchTrack(track: 'leo' | 'master') {
    this.currentTrack = track;
    const trackSrc = track === 'leo' ? '/audio/tamil_mass_bgm.mp3' : '/audio/master_mass_bgm.mp3';
    if (this.bgmAudio) {
      const wasPlaying = !this.isMuted;
      this.bgmAudio.pause();
      this.bgmAudio.src = trackSrc;
      this.bgmAudio.load();
      if (wasPlaying) {
        this.bgmAudio.play().catch(() => { });
      }
    }
  }

  /**
   * Crystalline resonant chime for interactive events
   */
  public playChime(freq = 440, type: OscillatorType = 'sine', duration = 0.6, volume = 0.1) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      // Soft pitch decay
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore
    }
  }

  /**
   * Handshake Harmonic Convergence Chord
   */
  public playHandshakeChord() {
    if (this.isMuted) return;
    const chord = [216, 270, 324, 432, 540]; // Solfeggio / natural harmonic series
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'sine', 1.8, 0.08);
      }, idx * 120);
    });
  }

  /**
   * Title Letter Reveal Thud & Sparkle
   */
  public playLetterReveal(index: number) {
    if (this.isMuted) return;
    const baseFreq = 260 + index * 45;
    this.playChime(baseFreq, 'triangle', 0.45, 0.07);
  }

  /**
   * Puppet Rope Pluck
   */
  public playRopePluck(pitch = 300) {
    if (this.isMuted) return;
    this.playChime(pitch, 'sine', 0.7, 0.12);
  }

  /**
   * Hover tick
   */
  public playHoverTick() {
    if (this.isMuted) return;
    this.playChime(780, 'sine', 0.08, 0.02);
  }

  /**
   * Crisp UI click / navigation transition
   */
  public playClick() {
    if (this.isMuted) return;
    this.playChime(640, 'triangle', 0.12, 0.05);
  }

  /**
   * Old mechanical typewriter / printing press key strike
   * Synthesizes mechanical key strike + cast-iron press thud + metallic paper impact
   */
  public playTypewriterKey(jitter = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;

      // 1. Heavy cast-iron press bed impact (deep physical thud)
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      const thudFreq = 120 + (jitter % 4) * 15;

      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(thudFreq, now);
      thudOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      thudGain.gain.setValueAtTime(0.14, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);

      thudOsc.start(now);
      thudOsc.stop(now + 0.1);

      // 2. Paper & ink friction noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04); // 40ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + (jitter % 5) * 90, now);
      filter.Q.setValueAtTime(2.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseNode.start(now);
      noiseNode.stop(now + 0.05);

      // 3. Resonant metallic mechanical type strike
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const strikeFreq = 720 + (jitter % 7) * 55;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(strikeFreq, now);
      osc.frequency.exponentialRampToValueAtTime(strikeFreq * 0.55, now + 0.07);

      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  /**
   * Futuristic Digital Neural-Network Morph Sweep
   */
  public playDigitalMorphSweep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.75);

      // Shimmering overtone
      setTimeout(() => {
        this.playChime(1320, 'sine', 0.5, 0.03);
      }, 250);
    } catch {
      // Ignore
    }
  }

  /**
   * Deep Cinematic Sub-Bass Impact for MANTIF Reveal
   */
  public playCinematicImpact() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;

      // Sub-bass sine drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 1.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.7);

      // Warm harmonic swell
      setTimeout(() => {
        this.playChime(432, 'sine', 1.4, 0.08);
      }, 100);
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle historical ambient breeze
   */
  public playHistoricalAmbience() {
    if (this.isMuted) return;
    this.playChime(320, 'sine', 1.8, 0.04);
  }

  /**
   * Deep cinematic curtain / shutter close transition
   */
  public playCurtainClose() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;

      // Low frequency cloth swoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundEngine();

// Auto-unlock Web Audio context on the first user interaction anywhere on the page
if (typeof window !== 'undefined') {
  const tryUnlock = () => {
    soundManager.unlockAudio();
  };
  ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach((evt) => {
    window.addEventListener(evt, tryUnlock, { once: true, passive: true });
  });
}
