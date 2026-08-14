class AudioAlertService {
  private ctx: AudioContext | null = null;
  private alarmOsc: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private isAlarmPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Short audible haptic confirmation beep when pressing buttons
   */
  public playClick(freq = 600, duration = 0.08) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted yet
    }
  }

  /**
   * Critical SOS Emergency Siren (pulsing high-low pitch)
   */
  public startEmergencySiren() {
    if (this.isAlarmPlaying) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.alarmOsc = ctx.createOscillator();
      this.alarmGain = ctx.createGain();

      this.alarmOsc.type = 'sawtooth';
      this.alarmOsc.frequency.setValueAtTime(880, ctx.currentTime);

      // Create sweeping siren effect
      const now = ctx.currentTime;
      for (let i = 0; i < 30; i++) {
        this.alarmOsc.frequency.setValueAtTime(880, now + i * 0.8);
        this.alarmOsc.frequency.linearRampToValueAtTime(1400, now + i * 0.8 + 0.4);
        this.alarmOsc.frequency.linearRampToValueAtTime(880, now + i * 0.8 + 0.8);
      }

      this.alarmGain.gain.setValueAtTime(0.2, ctx.currentTime);
      this.alarmOsc.connect(this.alarmGain);
      this.alarmGain.connect(ctx.destination);

      this.alarmOsc.start();
      this.isAlarmPlaying = true;
    } catch (err) {
      console.warn('Audio siren playback blocked until user interaction.');
    }
  }

  public stopEmergencySiren() {
    if (this.alarmOsc && this.isAlarmPlaying) {
      try {
        this.alarmOsc.stop();
        this.alarmOsc.disconnect();
      } catch {}
      this.isAlarmPlaying = false;
      this.alarmOsc = null;
    }
  }

  /**
   * Simulated Phone Ringing tone for SafeAI Fake Call
   */
  public playPhoneRing(durationSec = 15) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      // Standard North American ringback tones (440Hz + 480Hz)
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch {}
      }, durationSec * 1000);
    } catch {}
  }
}

export const audioAlerts = new AudioAlertService();
