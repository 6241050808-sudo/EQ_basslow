/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BandConfig } from '../types';
import { DEFAULT_BANDS } from './presets';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaElementSource: MediaElementAudioSourceNode | null = null;

  // Mic
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;

  // Nodes
  private inputGain: GainNode | null = null;
  private preampNode: GainNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private trebleBoostFilter: BiquadFilterNode | null = null;
  private panNode: StereoPannerNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Bypass routing
  private eqBranchGain: GainNode | null = null;
  private directBranchGain: GainNode | null = null;

  // Spatial effect
  private delayL: DelayNode | null = null;
  private delayR: DelayNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private spatialGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  // Procedural Synth Sequencer
  private synthInterval: number | null = null;
  private synthStep = 0;
  private isSynthPlaying = false;
  private synthBpm = 85;
  private currentDemoType: 'lofi' | 'synthwave' | 'bass808' = 'lofi';

  // Analysis buffers
  private freqData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;

  public isInitialized = false;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create HTML audio element for file playback
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.mediaElementSource = this.ctx.createMediaElementSource(this.audioElement);

    // Input gain
    this.inputGain = this.ctx.createGain();
    this.mediaElementSource.connect(this.inputGain);

    // Preamp
    this.preampNode = this.ctx.createGain();
    this.inputGain.connect(this.preampNode);

    // 10-Band Biquad Filters
    this.filters = DEFAULT_BANDS.map((band) => {
      const f = this.ctx!.createBiquadFilter();
      f.type = band.type;
      f.frequency.value = band.freq;
      f.Q.value = band.q;
      f.gain.value = band.gain;
      return f;
    });

    // Chain filters together
    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }

    // Acoustic boosters
    this.bassBoostFilter = this.ctx.createBiquadFilter();
    this.bassBoostFilter.type = 'lowshelf';
    this.bassBoostFilter.frequency.value = 90;
    this.bassBoostFilter.gain.value = 0;

    this.trebleBoostFilter = this.ctx.createBiquadFilter();
    this.trebleBoostFilter.type = 'highshelf';
    this.trebleBoostFilter.frequency.value = 10000;
    this.trebleBoostFilter.gain.value = 0;

    this.filters[this.filters.length - 1].connect(this.bassBoostFilter);
    this.bassBoostFilter.connect(this.trebleBoostFilter);

    // Bypass switching nodes
    this.eqBranchGain = this.ctx.createGain();
    this.directBranchGain = this.ctx.createGain();
    this.directBranchGain.gain.value = 0; // default not bypassed
    this.eqBranchGain.gain.value = 1;

    // Connect preamp to EQ chain and direct chain
    this.preampNode.connect(this.filters[0]);
    this.trebleBoostFilter.connect(this.eqBranchGain);

    this.preampNode.connect(this.directBranchGain);

    // Join branches to spatializer
    const postEqSum = this.ctx.createGain();
    this.eqBranchGain.connect(postEqSum);
    this.directBranchGain.connect(postEqSum);

    // Stereo Panner
    if (this.ctx.createStereoPanner) {
      this.panNode = this.ctx.createStereoPanner();
      postEqSum.connect(this.panNode);
    }

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    if (this.panNode) {
      this.panNode.connect(this.masterGain);
    } else {
      postEqSum.connect(this.masterGain);
    }

    // Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.82;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

    this.isInitialized = true;
  }

  public async resumeContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // --- Band Gains ---
  public setBandGain(bandIndex: number, gainDb: number) {
    if (!this.filters[bandIndex] || !this.ctx) return;
    const clamped = Math.max(-12, Math.min(12, gainDb));
    this.filters[bandIndex].gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.03);
  }

  public setAllBands(gains: number[]) {
    if (!this.ctx) return;
    gains.forEach((gain, index) => {
      this.setBandGain(index, gain);
    });
  }

  // --- Controls ---
  public setPreamp(gainDb: number) {
    if (!this.preampNode || !this.ctx) return;
    const linearGain = Math.pow(10, gainDb / 20);
    this.preampNode.gain.setTargetAtTime(linearGain, this.ctx.currentTime, 0.04);
  }

  public setMasterVolume(vol: number) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1.5, vol));
    this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.03);
  }

  public setPan(val: number) {
    if (!this.panNode || !this.ctx) return;
    const clamped = Math.max(-1, Math.min(1, val));
    this.panNode.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.04);
  }

  public setBassBoost(percent: number) {
    if (!this.bassBoostFilter || !this.ctx) return;
    // 0 to 100% maps to 0 to +10 dB
    const boostDb = (percent / 100) * 10;
    this.bassBoostFilter.gain.setTargetAtTime(boostDb, this.ctx.currentTime, 0.04);
  }

  public setTrebleBoost(percent: number) {
    if (!this.trebleBoostFilter || !this.ctx) return;
    // 0 to 100% maps to 0 to +8 dB
    const boostDb = (percent / 100) * 8;
    this.trebleBoostFilter.gain.setTargetAtTime(boostDb, this.ctx.currentTime, 0.04);
  }

  public setBypass(bypass: boolean) {
    if (!this.eqBranchGain || !this.directBranchGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (bypass) {
      this.eqBranchGain.gain.setTargetAtTime(0, now, 0.03);
      this.directBranchGain.gain.setTargetAtTime(1, now, 0.03);
    } else {
      this.eqBranchGain.gain.setTargetAtTime(1, now, 0.03);
      this.directBranchGain.gain.setTargetAtTime(0, now, 0.03);
    }
  }

  // --- Audio Frequency Response Curve calculation ---
  public getOverallFrequencyResponse(frequencies: Float32Array): Float32Array {
    const totalMag = new Float32Array(frequencies.length).fill(1.0);
    const magResponse = new Float32Array(frequencies.length);
    const phaseResponse = new Float32Array(frequencies.length);

    if (!this.filters || this.filters.length === 0) return totalMag;

    for (const filter of this.filters) {
      filter.getFrequencyResponse(frequencies, magResponse, phaseResponse);
      for (let i = 0; i < frequencies.length; i++) {
        totalMag[i] *= magResponse[i];
      }
    }

    if (this.bassBoostFilter && this.bassBoostFilter.gain.value > 0) {
      this.bassBoostFilter.getFrequencyResponse(frequencies, magResponse, phaseResponse);
      for (let i = 0; i < frequencies.length; i++) {
        totalMag[i] *= magResponse[i];
      }
    }

    if (this.trebleBoostFilter && this.trebleBoostFilter.gain.value > 0) {
      this.trebleBoostFilter.getFrequencyResponse(frequencies, magResponse, phaseResponse);
      for (let i = 0; i < frequencies.length; i++) {
        totalMag[i] *= magResponse[i];
      }
    }

    // Convert total magnitude to decibels
    const dbResponse = new Float32Array(frequencies.length);
    for (let i = 0; i < frequencies.length; i++) {
      dbResponse[i] = 20 * Math.log10(Math.max(0.0001, totalMag[i]));
    }
    return dbResponse;
  }

  // --- Real-time Spectrum and Peak Meter ---
  public getAnalyserData(): {
    freqData: Uint8Array;
    timeData: Uint8Array;
    peakL: number;
    peakR: number;
    isClipping: boolean;
  } {
    if (!this.analyser || !this.freqData || !this.timeData) {
      return {
        freqData: new Uint8Array(0),
        timeData: new Uint8Array(0),
        peakL: 0,
        peakR: 0,
        isClipping: false,
      };
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    // Compute peak from time domain data (128 is center 0)
    let peak = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const normalized = Math.abs((this.timeData[i] - 128) / 128);
      if (normalized > peak) peak = normalized;
    }

    // Slight difference for pseudo stereo visualization
    const panOffset = this.panNode ? this.panNode.pan.value : 0;
    const peakL = Math.min(1, Math.max(0, peak * (1 - panOffset * 0.4)));
    const peakR = Math.min(1, Math.max(0, peak * (1 + panOffset * 0.4)));

    return {
      freqData: this.freqData,
      timeData: this.timeData,
      peakL,
      peakR,
      isClipping: peak >= 0.98,
    };
  }

  // --- Media Element & Audio File Handling ---
  public loadAudioFile(file: File): Promise<{ duration: number; title: string }> {
    this.init();
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      if (!this.audioElement) {
        reject(new Error('Audio element not initialized'));
        return;
      }
      this.stopProceduralTrack();
      this.stopMic();

      this.audioElement.src = objectUrl;
      this.audioElement.onloadedmetadata = () => {
        resolve({
          duration: this.audioElement?.duration || 0,
          title: file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      this.audioElement.onerror = () => {
        reject(new Error('Cannot load audio file'));
      };
      this.audioElement.load();
    });
  }

  public playAudio() {
    this.resumeContext();
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.play().catch(console.error);
    }
  }

  public pauseAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public seekAudio(seconds: number) {
    if (this.audioElement && !isNaN(seconds)) {
      this.audioElement.currentTime = seconds;
    }
  }

  public getPlaybackTime(): { current: number; duration: number } {
    if (!this.audioElement || !this.audioElement.src) {
      return { current: 0, duration: 0 };
    }
    return {
      current: this.audioElement.currentTime || 0,
      duration: this.audioElement.duration || 0,
    };
  }

  public setLoop(loop: boolean) {
    if (this.audioElement) {
      this.audioElement.loop = loop;
    }
  }

  // --- Microphone Support ---
  public async startMic(): Promise<boolean> {
    this.init();
    await this.resumeContext();

    // Stop other playback
    this.pauseAudio();
    this.stopProceduralTrack();

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      if (!this.ctx || !this.inputGain) return false;
      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.micSource.connect(this.inputGain);
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable', err);
      return false;
    }
  }

  public stopMic() {
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  // --- Built-in Procedural Synthesizer Demo Tracks ---
  // High quality multi-frequency synth music built purely with Web Audio!
  public startProceduralTrack(type: 'lofi' | 'synthwave' | 'bass808') {
    this.init();
    this.resumeContext();
    this.pauseAudio();
    this.stopMic();
    this.stopProceduralTrack();

    this.currentDemoType = type;
    this.isSynthPlaying = true;
    this.synthStep = 0;

    let intervalMs = 175; // 85 bpm 16th notes
    if (type === 'synthwave') {
      intervalMs = 125; // 120 bpm
    } else if (type === 'bass808') {
      intervalMs = 115; // 130 bpm
    }

    this.synthInterval = window.setInterval(() => {
      if (!this.isSynthPlaying || !this.ctx) return;
      this.playSynthStep(this.synthStep % 32);
      this.synthStep++;
    }, intervalMs);
  }

  public stopProceduralTrack() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public getIsSynthPlaying(): boolean {
    return this.isSynthPlaying;
  }

  private playSynthStep(step: number) {
    if (!this.ctx || !this.inputGain) return;
    const now = this.ctx.currentTime;

    if (this.currentDemoType === 'lofi') {
      this.playLofiStep(step, now);
    } else if (this.currentDemoType === 'synthwave') {
      this.playSynthwaveStep(step, now);
    } else {
      this.play808Step(step, now);
    }
  }

  // Lo-Fi Beat Generator
  private playLofiStep(step: number, now: number) {
    // Kick on steps 0, 10, 18, 26
    if ([0, 10, 18, 26].includes(step)) {
      this.triggerKick(now, 110, 38, 0.45, 0.6);
    }
    // Snare / Rim on 8, 24
    if ([8, 24].includes(step)) {
      this.triggerSnare(now, 180, 0.28, 0.4);
    }
    // Hi-hats with subtle swing every 2 steps
    if (step % 2 === 0) {
      this.triggerHiHat(now, step % 4 === 2, 0.08, 0.25);
    }
    // Electric Piano Chords (maj7/min9) on step 0, 16
    if (step === 0) {
      this.playRhodesChord([261.63, 329.63, 392.0, 493.88], now, 2.2); // Cmaj7
    } else if (step === 16) {
      this.playRhodesChord([220.0, 261.63, 329.63, 392.0], now, 2.2); // Am7
    }
    // Deep Sub Warm Bass
    if ([0, 6, 12, 16, 22, 28].includes(step)) {
      const notes = [65.41, 73.42, 65.41, 55.0, 58.27, 49.0];
      const noteIdx = Math.floor(step / 6) % notes.length;
      this.triggerSubBass(now, notes[noteIdx], 0.5, 0.55);
    }
  }

  // Synthwave 80s Driving Beat
  private playSynthwaveStep(step: number, now: number) {
    // 4-on-the-floor Kick
    if (step % 4 === 0) {
      this.triggerKick(now, 140, 45, 0.35, 0.7);
    }
    // Gated Snare on 4, 12, 20, 28
    if ([4, 12, 20, 28].includes(step)) {
      this.triggerSnare(now, 220, 0.35, 0.5);
    }
    // 16th note closed hats
    this.triggerHiHat(now, step % 2 === 1, 0.05, 0.18);

    // Driving 16th-note electro bassline (sawtooth filtered)
    const rootNotes = [65.41, 65.41, 77.78, 87.31];
    const bar = Math.floor(step / 8) % rootNotes.length;
    const octave = step % 2 === 0 ? 1 : 2;
    this.triggerSynthBass(now, rootNotes[bar] * octave, 0.15, 0.4);

    // Lead Arp on high steps
    if (step % 2 === 1) {
      const arpFreqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      const freq = arpFreqs[(step + bar) % arpFreqs.length];
      this.triggerLeadArp(now, freq, 0.12, 0.25);
    }
  }

  // 808 Trap & Sub Bass Beat
  private play808Step(step: number, now: number) {
    // Booming 808 Sub Drop on step 0, 14, 24
    if ([0, 14, 24].includes(step)) {
      this.trigger808Drop(now, 42, 0.9, 0.8);
    }
    // Trap Snare on 8, 24
    if ([8, 24].includes(step)) {
      this.triggerSnare(now, 260, 0.2, 0.55);
    }
    // Rapid Trap Hi-hat rolls
    if (step % 2 === 0 || (step >= 12 && step <= 15)) {
      this.triggerHiHat(now, step % 4 === 0, 0.04, 0.3);
    }
    // Atmospheric dark pad chords
    if (step === 0) {
      this.playDarkPad([174.61, 207.65, 261.63], now, 3.2);
    } else if (step === 16) {
      this.playDarkPad([155.56, 196.0, 233.08], now, 3.2);
    }
  }

  // --- Sound Synthesis Helpers ---
  private triggerKick(time: number, startFreq: number, endFreq: number, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.inputGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private trigger808Drop(time: number, rootFreq: number, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(rootFreq * 2.5, time);
    osc.frequency.exponentialRampToValueAtTime(rootFreq, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.linearRampToValueAtTime(vol * 0.8, time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.inputGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerSnare(time: number, toneFreq: number, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(toneFreq, time);
    osc.frequency.exponentialRampToValueAtTime(toneFreq * 0.5, time + dur * 0.5);

    oscGain.gain.setValueAtTime(vol * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.6);
    osc.connect(oscGain);
    oscGain.connect(this.inputGain);

    osc.start(time);
    osc.stop(time + dur);

    // White Noise Snap
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.inputGain);

    noise.start(time);
    noise.stop(time + dur);
  }

  private triggerHiHat(time: number, isAccent: boolean, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 9500;
    filter.Q.value = 2.5;

    const gain = this.ctx.createGain();
    const actualVol = isAccent ? vol * 1.3 : vol * 0.7;
    gain.gain.setValueAtTime(actualVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.inputGain);

    noise.start(time);
    noise.stop(time + dur);
  }

  private triggerSubBass(time: number, freq: number, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.inputGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerSynthBass(time: number, freq: number, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(250, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.inputGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerLeadArp(time: number, freq: number, dur: number, vol: number) {
    if (!this.ctx || !this.inputGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.inputGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playRhodesChord(freqs: number[], time: number, dur: number) {
    if (!this.ctx || !this.inputGain) return;
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(gain);
      gain.connect(this.inputGain!);

      osc.start(time);
      osc.stop(time + dur);
    });
  }

  private playDarkPad(freqs: number[], time: number, dur: number) {
    if (!this.ctx || !this.inputGain) return;
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.07, time + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.inputGain!);

      osc.start(time);
      osc.stop(time + dur);
    });
  }
}

export const audioEngine = new AudioEngine();
