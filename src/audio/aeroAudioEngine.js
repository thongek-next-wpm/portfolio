// Pure-JS PCM WAV synthesizer & HTML5 Audio player for Windows Vista loading ambience
// and the Vista startup theme ringing seamlessly into the main desktop.

const SAMPLE_RATE = 44100;

let cachedAmbienceUrl = null;
let cachedStartupUrl = null;

function encodeMonoWav(samples) {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

function getVistaAmbienceUrl() {
  if (cachedAmbienceUrl) return cachedAmbienceUrl;

  const durSec = 2.8;
  const total = Math.floor(SAMPLE_RATE * durSec);
  const out = new Float32Array(total);
  const padFreqs = [155.56, 233.08, 392.0];

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.35) * Math.min(1, (durSec - t) / 0.6);

    let sum = 0;
    for (let p = 0; p < padFreqs.length; p += 1) {
      const f = padFreqs[p];
      sum += Math.sin(2 * Math.PI * f * t) * 0.14;
      sum += Math.sin(2 * Math.PI * f * 1.003 * t) * 0.08;
    }

    // Soft glass droplet at t=0.25s and t=1.35s
    if (t >= 0.25) {
      const dt = t - 0.25;
      sum += Math.sin(2 * Math.PI * 622.25 * dt) * Math.exp(-dt * 2.4) * Math.min(1, dt / 0.04) * 0.16;
    }
    if (t >= 1.35) {
      const dt = t - 1.35;
      sum += Math.sin(2 * Math.PI * 932.33 * dt) * Math.exp(-dt * 2.5) * Math.min(1, dt / 0.04) * 0.14;
    }

    out[i] = Math.tanh(sum * env * 0.85);
  }

  cachedAmbienceUrl = encodeMonoWav(out);
  return cachedAmbienceUrl;
}

function getVistaStartupThemeUrl() {
  if (cachedStartupUrl) return cachedStartupUrl;

  const durSec = 4.6;
  const total = Math.floor(SAMPLE_RATE * durSec);
  const out = new Float32Array(total);

  const padChord = [
    { freq: 155.56, amp: 0.16 }, // Eb3
    { freq: 233.08, amp: 0.13 }, // Bb3
    { freq: 392.0, amp: 0.11 }, // G4
    { freq: 587.33, amp: 0.075 }, // D5
  ];

  const chimes = [
    { freq: 622.25, start: 0.08, decay: 1.35, amp: 0.22 }, // Eb5
    { freq: 932.33, start: 0.36, decay: 1.45, amp: 0.2 }, // Bb5
    { freq: 783.99, start: 0.72, decay: 1.4, amp: 0.21 }, // G5
    { freq: 622.25, start: 1.14, decay: 1.25, amp: 0.19 }, // Eb5
    { freq: 698.46, start: 1.54, decay: 1.05, amp: 0.24 }, // F5 warm resolution
  ];

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE;
    const tailFade = Math.min(1, (durSec - t) / 0.85);
    const padAttack = Math.min(1, t / 0.55);
    const padSwell = Math.exp(-Math.max(0, t - 1.2) * 0.45);

    let sum = 0;

    for (let p = 0; p < padChord.length; p += 1) {
      const { freq, amp } = padChord[p];
      const wave =
        Math.sin(2 * Math.PI * freq * t) * 0.72 +
        Math.sin(2 * Math.PI * freq * 1.003 * t) * 0.45 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.14;
      sum += wave * amp * padAttack * padSwell;
    }

    for (let c = 0; c < chimes.length; c += 1) {
      const { freq, start, decay, amp } = chimes[c];
      if (t >= start) {
        const dt = t - start;
        const att = Math.min(1, dt / 0.028);
        const env = att * Math.exp(-dt * decay);
        const bell =
          Math.sin(2 * Math.PI * freq * dt) * 0.78 +
          Math.sin(2 * Math.PI * freq * 0.9975 * dt) * 0.35 +
          Math.sin(2 * Math.PI * freq * 2 * dt) * Math.exp(-dt * 2.8) * 0.22;
        sum += bell * amp * env;
      }
    }

    out[i] = Math.tanh(sum * tailFade * 0.72);
  }

  cachedStartupUrl = encodeMonoWav(out);
  return cachedStartupUrl;
}

export class VistaThemeAudioSession {
  constructor() {
    this.ambienceAudio = null;
    this.startupAudio = null;
    this.themePlayed = false;
    this.muted = false;
  }

  setMuted(isMuted) {
    this.muted = Boolean(isMuted);
    if (this.ambienceAudio) {
      this.ambienceAudio.muted = this.muted;
    }
    if (this.startupAudio) {
      this.startupAudio.muted = this.muted;
    }
  }

  async startLoadingAmbience() {
    if (this.muted || this.themePlayed) return false;
    if (!this.ambienceAudio) {
      const audio = new Audio(getVistaAmbienceUrl());
      audio.volume = 0.42;
      audio.muted = this.muted;
      this.ambienceAudio = audio;
    }

    if (!this.ambienceAudio.paused) return true;

    try {
      await this.ambienceAudio.play();
      return true;
    } catch {
      return false;
    }
  }

  stopLoadingAmbience() {
    if (this.ambienceAudio) {
      this.ambienceAudio.pause();
      this.ambienceAudio.currentTime = 0;
    }
  }

  async playStartupThemeAndRelease() {
    if (this.themePlayed || this.muted) return false;

    const audio = new Audio(getVistaStartupThemeUrl());
    audio.volume = 0.62;
    audio.muted = this.muted;
    this.startupAudio = audio;

    try {
      await audio.play();
      this.themePlayed = true;
      this.stopLoadingAmbience();
      audio.addEventListener(
        'ended',
        () => {
          if (this.startupAudio === audio) {
            this.startupAudio = null;
          }
        },
        { once: true }
      );
      return true;
    } catch {
      this.startupAudio = null;
      return false;
    }
  }

  dispose() {
    this.stopLoadingAmbience();
    this.ambienceAudio = null;
  }
}
