/**
 * Procedural gentle mountain wind audio synthesizer using Web Audio API.
 * Completely self-contained: no external audio files required, fails gracefully.
 */
class WindAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      // Web Audio unsupported
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    if (this.isPlaying) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds noise loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink-noise approximation (natural deep wind murmur)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 3);

    this.noiseNode.connect(this.filter);
    this.filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.noiseNode.start();
    this.isPlaying = true;

    // Organic wind breath modulation
    this.intervalId = window.setInterval(() => {
      if (!this.filter || !this.gainNode || !this.ctx) return;
      const targetFreq = 220 + Math.random() * 260;
      const targetGain = 0.2 + Math.random() * 0.25;
      const now = this.ctx.currentTime;
      this.filter.frequency.setTargetAtTime(targetFreq, now, 2.5);
      this.gainNode.gain.setTargetAtTime(targetGain, now, 2.0);
    }, 3500);
  }

  public boostForDeparture() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Harmonic celestial chime & rising shimmer
    try {
      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major celestial sweep
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.8);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.12 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + 2.2);
      });
    } catch {
      // ignore
    }

    if (!this.isPlaying || !this.filter || !this.gainNode) return;
    const now = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(800, now, 0.8);
    this.gainNode.gain.setTargetAtTime(0.6, now, 0.5);
  }

  public stop() {
    if (!this.isPlaying) return;
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.8);
      setTimeout(() => {
        try {
          this.noiseNode?.stop();
          this.noiseNode?.disconnect();
        } catch {
          // ignore
        }
        this.isPlaying = false;
      }, 1000);
    } else {
      this.isPlaying = false;
    }
  }

  public get active() {
    return this.isPlaying;
  }
}

export const windAudio = new WindAudioEngine();

/**
 * Primes and wakes up mobile device audio subsystem on first touch/interaction.
 * Enables unmuted media playback in iOS Safari and Android Chrome.
 */
export function unlockMobileAudioHardware() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
  } catch {
    // ignore
  }
}
