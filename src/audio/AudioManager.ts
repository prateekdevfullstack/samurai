export type AudioLayer = 'ambience' | 'birds' | 'wind' | 'flute' | 'drums' | 'battle';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private layers: Map<AudioLayer, { gain: GainNode; osc?: OscillatorNode; noise?: AudioBufferSourceNode }> =
    new Map();
  private started = false;
  private progress = 0;

  async init(): Promise<void> {
    if (this.started) return;

    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);

      this.createProceduralLayer('ambience', 80, 'sine', 0.02);
      this.createProceduralLayer('birds', 1200, 'sine', 0);
      this.createProceduralLayer('wind', 200, 'triangle', 0.03);
      this.createProceduralLayer('flute', 440, 'sine', 0);
      this.createProceduralLayer('drums', 60, 'sine', 0);
      this.createProceduralLayer('battle', 100, 'sawtooth', 0);

      this.started = true;
    } catch {
      // Audio unavailable
    }
  }

  private createProceduralLayer(
    name: AudioLayer,
    freq: number,
    type: OscillatorType,
    volume: number
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    gain.connect(this.masterGain);

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start();

    this.layers.set(name, { gain, osc });
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  updateProgress(progress: number): void {
    this.progress = progress;
    const phase = progress * 7;

    this.setLayerVolume('ambience', phase < 4 ? 0.03 : 0.01);
    this.setLayerVolume('birds', phase < 1.5 ? 0.015 : 0);
    this.setLayerVolume('wind', phase > 0.5 && phase < 5 ? 0.02 : 0.005);
    this.setLayerVolume('flute', phase > 1 && phase < 3.5 ? 0.02 : phase > 6 ? 0.04 : 0);
    this.setLayerVolume('drums', phase > 2.5 && phase < 4 ? 0.03 : phase > 4 && phase < 5.5 ? 0.05 : 0);
    this.setLayerVolume('battle', phase > 3.5 && phase < 5.5 ? 0.02 : 0);

    if (phase > 5.3 && phase < 5.8) {
      this.setLayerVolume('ambience', 0);
      this.setLayerVolume('drums', 0);
      this.setLayerVolume('battle', 0);
    }
  }

  playSlash(): void {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  private setLayerVolume(layer: AudioLayer, volume: number): void {
    const entry = this.layers.get(layer);
    if (entry && this.ctx) {
      entry.gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
    }
  }

  destroy(): void {
    this.layers.forEach(({ osc }) => osc?.stop());
    this.layers.clear();
    this.ctx?.close();
    this.ctx = null;
  }
}
