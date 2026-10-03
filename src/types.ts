/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FilterType = 'lowshelf' | 'peaking' | 'highshelf';

export interface BandConfig {
  id: number;
  freq: number;
  label: string;
  gain: number; // in dB (-12 to +12)
  type: FilterType;
  q: number;
  description: string;
}

export interface EQPreset {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  isCustom?: boolean;
  gains: number[]; // 10 values in dB
}

export type AudioSourceType = 'demo' | 'file' | 'mic';

export interface DemoTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  preamp: number; // -12 to +12 dB
  pan: number; // -1 to 1
  bassBoost: number; // 0 to 100%
  trebleBoost: number; // 0 to 100%
  spatialWidth: number; // 0 to 100%
  isBypassed: boolean;
  isMuted: boolean;
  isLooping: boolean;
  sourceType: AudioSourceType;
  selectedTrackId: string;
  customFileName?: string;
  micActive: boolean;
}
