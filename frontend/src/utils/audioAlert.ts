// Audio Alert Synthesizer using Web Audio API
// Synthesizes pleasant command-center chime and high-urgency weather hazard beeps

class AudioAlertSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastAlertId: string | null = null;

  constructor() {
    // Check localStorage for saved mute preference
    const saved = localStorage.getItem("air_ops_audio_muted");
    if (saved !== null) {
      this.isMuted = saved === "true";
    }
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem("air_ops_audio_muted", String(muted));
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * High Urgency Warning Chime (Weather Hazard / Severe Storm)
   * Dual-tone pulsed harmonic: 880Hz -> 659Hz (A5 -> E5)
   */
  public playHighAlertSound(alertId?: string) {
    if (this.isMuted) return;
    if (alertId && alertId === this.lastAlertId) return; // Deduplicate
    if (alertId) this.lastAlertId = alertId;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // First beep (880 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Second beep (659 Hz) with brief gap
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659, now + 0.28);
      gain2.gain.setValueAtTime(0, now + 0.28);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.32);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 0.58);
    } catch (err) {
      console.warn("Audio synthesizer error:", err);
    }
  }

  /**
   * Subtle Command Center Notification chime
   */
  public playNoticeChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch (err) {
      console.warn("Audio synthesizer notice error:", err);
    }
  }

  /**
   * Test sound button preview
   */
  public testSound() {
    const wasMuted = this.isMuted;
    if (wasMuted) this.setMuted(false);
    this.playHighAlertSound();
    if (wasMuted) {
      setTimeout(() => this.setMuted(true), 600);
    }
  }
}

export const soundSynthesizer = new AudioAlertSynthesizer();
