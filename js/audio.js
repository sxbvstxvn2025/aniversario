/**
 * MOTOR DE SONIDO PROCEDURAL (Web Audio API)
 * Genera efectos adorables y suaves sin necesidad de archivos externos.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('game_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('game_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  _playTone(freq, duration, type = 'sine', gainVal = 0.15, freqEnd = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (freqEnd !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), now + duration);
      }

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio context might fail before user interaction
    }
  }

  jump() {
    this._playTone(280, 0.14, 'triangle', 0.16, 520);
  }

  doubleJump() {
    this._playTone(480, 0.16, 'sine', 0.14, 820);
  }

  bounce() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(560, now + 0.12);
      osc.frequency.linearRampToValueAtTime(320, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  collect(combo = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      const freq = notes[Math.min(combo - 1, notes.length - 1)] || 659.25;
      const now = this.ctx.currentTime;

      // Armónico cálido tipo campanita
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.28);
      osc2.stop(now + 0.28);
    } catch (e) {}
  }

  collectStar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [659.25, 830.61, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this._playTone(freq, 0.18, 'sine', 0.12, freq * 1.1);
      }, idx * 60);
    });
  }

  powerUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.12, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.15);
      });
    } catch (e) {}
  }

  shieldPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  hit() {
    this._playTone(160, 0.22, 'triangle', 0.2, 70);
  }

  victory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const fanfare = [
      { f: 523.25, d: 0.18 }, // C5
      { f: 659.25, d: 0.18 }, // E5
      { f: 783.99, d: 0.22 }, // G5
      { f: 1046.50, d: 0.45 } // C6
    ];
    let offset = 0;
    fanfare.forEach(n => {
      setTimeout(() => {
        this._playTone(n.f, n.d, 'sine', 0.2);
      }, offset);
      offset += n.d * 900;
    });
  }

  // Alerta dramática de jefe
  bossAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this._playTone(220, 0.2, 'sawtooth', 0.16, 180);
    setTimeout(() => {
      this._playTone(246.94, 0.2, 'sawtooth', 0.18, 196);
    }, 180);
    setTimeout(() => {
      this._playTone(330, 0.45, 'sawtooth', 0.22, 220);
    }, 360);
  }

  // Daño a la ardilla malévola (golpe cómico y chillido)
  bossHit() {
    this._playTone(380, 0.18, 'triangle', 0.22, 160);
    setTimeout(() => {
      this._playTone(620, 0.12, 'sine', 0.15, 880);
    }, 40);
  }

  // Lanzamiento de bellota por la ardilla
  bossThrow() {
    this._playTone(320, 0.15, 'sine', 0.14, 180);
  }

  // Rayo de corazón disparado por el gatito
  heartBeam() {
    this._playTone(720, 0.16, 'triangle', 0.18, 1250);
  }

  // Gran fanfarria de victoria total contra el jefe
  bossDefeatFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const triumphant = [
      { f: 523.25, d: 0.14 }, // C5
      { f: 659.25, d: 0.14 }, // E5
      { f: 783.99, d: 0.16 }, // G5
      { f: 1046.50, d: 0.22 }, // C6
      { f: 880.00, d: 0.18 }, // A5
      { f: 1046.50, d: 0.2 },  // C6
      { f: 1318.51, d: 0.55 }  // E6
    ];
    let offset = 0;
    triumphant.forEach(n => {
      setTimeout(() => {
        this._playTone(n.f, n.d, 'triangle', 0.22);
      }, offset);
      offset += n.d * 750;
    });
  }
}

// Instancia global
window.sound = new SoundEngine();
