/* ==========================================================================
   audio.js — Web Audio API Synthesizer for Cycloid & Planetary Kinematics Lab
   Simulates mechanical gear-tooth ticks and rotary shaft hum.
   ========================================================================== */
(function (global) {
  'use strict';

  class KinematicsAudio {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.motorOsc = null;
      this.motorGain = null;
      this.initOnFirstUserGesture();
    }

    initOnFirstUserGesture() {
      if (typeof window === 'undefined') return;
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
      if (typeof window === 'undefined') return false;
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
      if (!this.enabled && this.motorGain && this.ctx) {
        this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return this.enabled;
    }

    playGearTick(pitch = 1.0) {
      if (!this.ensureContext()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.024);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    }

    setEngineSpeed(rpm) {
      if (!this.ensureContext()) return;
      const now = this.ctx.currentTime;
      const targetFreq = 42 + (rpm / 60) * 16;

      if (!this.motorOsc) {
        this.motorOsc = this.ctx.createOscillator();
        this.motorGain = this.ctx.createGain();

        this.motorOsc.type = 'sawtooth';
        this.motorOsc.frequency.setValueAtTime(targetFreq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(210, now);

        this.motorGain.gain.setValueAtTime(0.022, now);

        this.motorOsc.connect(filter);
        filter.connect(this.motorGain);
        this.motorGain.connect(this.ctx.destination);
        this.motorOsc.start(now);
      } else {
        this.motorOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);
        this.motorGain.gain.setValueAtTime(0.022, now);
      }
    }

    stopEngine() {
      if (this.motorGain && this.ctx) {
        this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    }
  }

  global.KinematicsAudio = KinematicsAudio;
})(window);
