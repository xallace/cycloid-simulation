/**
 * Web Audio API Synthesizer for Cycloid & Planetary Kinematics Lab
 * Simulates mechanical gear clicks, rotation hum, and UI interactions.
 */

class KinematicsAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false; // Default muted for unobtrusive experience
    this.motorOsc = null;
    this.motorGain = null;
    this.initOnFirstUserGesture();
  }

  initOnFirstUserGesture() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx && this.enabled;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.motorGain) {
      this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  // Gear tooth mesh click
  playGearTick(pitch = 1.0) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Wankel rotary shaft hum
  setEngineSpeed(rpm) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const targetFreq = 40 + (rpm / 60) * 15;

    if (!this.motorOsc) {
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc.type = 'sawtooth';
      this.motorOsc.frequency.setValueAtTime(targetFreq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      this.motorGain.gain.setValueAtTime(0.025, now);

      this.motorOsc.connect(filter);
      filter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start(now);
    } else {
      this.motorOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);
      this.motorGain.gain.setValueAtTime(0.025, now);
    }
  }

  stopEngine() {
    if (this.motorGain && this.ctx) {
      this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }
}
