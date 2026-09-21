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
  public playChime(_freq?: number, _type?: OscillatorType, _duration?: number, _volume?: number) {
    bulletAudio.playLetterReveal();
  }
  public playHandshakeChord() {
    bulletAudio.playHandshakeChord();
  }
  public playLetterReveal(index?: number) {
    bulletAudio.playLetterReveal(index ?? 0);
  }
  public playRopePluck(_pitch?: number) {
    bulletAudio.playHoverTick();
  }
  public playHoverTick() {
    bulletAudio.playHoverTick();
  }
  public playClick() {
    bulletAudio.playHoverTick();
  }
  public playTypewriterKey(jitter?: number, isFinal?: boolean) {
    bulletAudio.playBulletImpact(jitter ?? 0, isFinal ?? false);
  }
  public playDigitalMorphSweep() {
    bulletAudio.playTorchFlash();
  }
  public playCinematicImpact() {
    bulletAudio.playUniqueGlobeBlast();
  }
  public playHistoricalAmbience() {}
  public playCurtainClose() {}
  public playErodePulse() {}
  public playAtmosphereTransition() {}
  public playSubtleImpact() {
    bulletAudio.playHoverTick();
  }
  public playGlobeHum() {}
  public playCosmicGlobeBlast() {
    bulletAudio.playUniqueGlobeBlast();
  }
  public playTorchFlash() {
    bulletAudio.playTorchFlash();
  }
  public playDigitalChirp() {
    bulletAudio.playHoverTick();
  }
  public playCinematicSwell() {}
  public playNotificationChime(index?: number) {
    bulletAudio.playLetterReveal(index ?? 0);
  }
}

export const soundManager = new SoundEngine();
