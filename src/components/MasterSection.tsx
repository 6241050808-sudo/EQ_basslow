/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Gauge, 
  Disc, 
  Sparkles, 
  RotateCcw,
  Radio
} from 'lucide-react';

interface MasterSectionProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
  preamp: number;
  onPreampChange: (db: number) => void;
  pan: number;
  onPanChange: (pan: number) => void;
  bassBoost: number;
  onBassBoostChange: (val: number) => void;
  trebleBoost: number;
  onTrebleBoostChange: (val: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MasterSection: React.FC<MasterSectionProps> = ({
  volume,
  onVolumeChange,
  preamp,
  onPreampChange,
  pan,
  onPanChange,
  bassBoost,
  onBassBoostChange,
  trebleBoost,
  onTrebleBoostChange,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          Master & Acoustic Enhancers
        </span>
        <span className="text-xs text-slate-400">ควบคุมระดับเสียงหลักและมิติเสียง</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Preamp Gain */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Preamp Gain
            </span>
            <span className="text-xs font-mono-audio font-bold text-cyan-400">
              {preamp > 0 ? `+${preamp.toFixed(1)}` : preamp.toFixed(1)} dB
            </span>
          </div>

          <input
            id="preamp-slider"
            type="range"
            min="-12"
            max="12"
            step="0.5"
            value={preamp}
            onChange={(e) => onPreampChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono-audio">
            <span>-12dB</span>
            <button
              id="reset-preamp-btn"
              onClick={() => onPreampChange(0)}
              className="text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> 0dB
            </button>
            <span>+12dB</span>
          </div>
        </div>

        {/* Master Volume */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <button
              id="mute-toggle-btn"
              onClick={onToggleMute}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>ความดังหลัก</span>
            </button>
            <span className={`text-xs font-mono-audio font-bold ${isMuted ? 'text-rose-400 line-through' : 'text-emerald-400'}`}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            id="master-volume-slider"
            type="range"
            min="0"
            max="1.5"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono-audio">
            <span>0%</span>
            <button
              id="reset-volume-btn"
              onClick={() => onVolumeChange(1.0)}
              className="text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> 100%
            </button>
            <span>150%</span>
          </div>
        </div>

        {/* Stereo Pan */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-amber-400" />
              มิติซ้าย-ขวา (Pan)
            </span>
            <span className="text-xs font-mono-audio font-bold text-amber-400">
              {pan === 0
                ? 'Center'
                : pan < 0
                ? `L ${Math.round(Math.abs(pan) * 100)}%`
                : `R ${Math.round(pan * 100)}%`}
            </span>
          </div>

          <input
            id="stereo-pan-slider"
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={pan}
            onChange={(e) => onPanChange(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono-audio">
            <span>L</span>
            <button
              id="reset-pan-btn"
              onClick={() => onPanChange(0)}
              className="text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Center
            </button>
            <span>R</span>
          </div>
        </div>

        {/* Bass Booster Knob/Slider */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Bass Boost
            </span>
            <span className="text-xs font-mono-audio font-bold text-rose-400">
              +{Math.round(bassBoost)}%
            </span>
          </div>

          <input
            id="bass-boost-slider"
            type="range"
            min="0"
            max="100"
            step="5"
            value={bassBoost}
            onChange={(e) => onBassBoostChange(parseFloat(e.target.value))}
            className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono-audio">
            <span>0%</span>
            <button
              id="reset-bass-boost-btn"
              onClick={() => onBassBoostChange(0)}
              className="text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> 0%
            </button>
            <span>+100%</span>
          </div>
        </div>

        {/* Treble Air Booster */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Treble Air
            </span>
            <span className="text-xs font-mono-audio font-bold text-purple-400">
              +{Math.round(trebleBoost)}%
            </span>
          </div>

          <input
            id="treble-boost-slider"
            type="range"
            min="0"
            max="100"
            step="5"
            value={trebleBoost}
            onChange={(e) => onTrebleBoostChange(parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono-audio">
            <span>0%</span>
            <button
              id="reset-treble-boost-btn"
              onClick={() => onTrebleBoostChange(0)}
              className="text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> 0%
            </button>
            <span>+100%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
