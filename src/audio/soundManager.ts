/**
 * Minimalist Web Audio API Sound Generator for MANTIF
 * Uses pure procedural synthesis (no external audio files required).
 * Ultra-low latency, zero network dependency, completely opt-in.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private currentTrack: 'leo' | 'master' = 'leo';

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext unavailable
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
        this.ctx.resume();
      }
      if (this.masterGain) {
        const targetGain = this.isMuted ? 0 : 0.35;
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
        this.bgmAudio.play().catch(() => {});
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
}

export const soundManager = new SoundEngine();
