import { bulletAudio } from './bulletAudio';

class SoundEngine {
  public init() {}
  public unlockAudio() {
    bulletAudio.unlock();
  }
  public subscribe(_listener: (isMuted: boolean) => void): () => void { return () => {}; }
  public toggleMute(): boolean { return true; }
  public setMuted(_muted: boolean) {}
  public getMuted(): boolean { return true; }
  public playChime(_freq?: number, _type?: OscillatorType, _duration?: number, _volume?: number) {}
  public playHandshakeChord() {
    bulletAudio.playHandshakeChord();
  }
  public playLetterReveal(index?: number) {
    bulletAudio.playLetterReveal(index);
  }
  public playRopePluck(_pitch?: number) {}
  public playHoverTick() {
    bulletAudio.playHoverTick();
  }
  public playClick() {
    bulletAudio.playHoverTick();
  }
  public playTypewriterKey(jitter?: number, isFinal?: boolean) {
    bulletAudio.playBulletImpact(jitter, isFinal);
  }
  public playDigitalMorphSweep() {}
  public playCinematicImpact() {}
  public playHistoricalAmbience() {}
  public playCurtainClose() {}
  public playErodePulse() {}
  public playAtmosphereTransition() {}
  public playSubtleImpact() {}
  public playGlobeHum() {}
  public playCosmicGlobeBlast() {
    bulletAudio.playUniqueGlobeBlast();
  }
  public playDigitalChirp() {}
  public playCinematicSwell() {}
  public playNotificationChime(_index?: number) {}
}

export const soundManager = new SoundEngine();
