/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { BandConfig } from '../types';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface BandFadersProps {
  bands: BandConfig[];
  onBandChange: (index: number, newGain: number) => void;
  onResetBand: (index: number) => void;
  isBypassed: boolean;
}

export const BandFaders: React.FC<BandFadersProps> = ({
  bands,
  onBandChange,
  onResetBand,
  isBypassed,
}) => {
  const [activeBandIndex, setActiveBandIndex] = useState<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const getFreqCategory = (freq: number) => {
    if (freq <= 125) return { label: 'BASS', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (freq <= 2000) return { label: 'MID', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    return { label: 'TREBLE', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
  };

  const getGainColor = (gain: number) => {
    if (gain > 0) return 'text-cyan-400';
    if (gain < 0) return 'text-amber-400';
    return 'text-slate-400';
  };

  const getTrackFill = (gain: number) => {
    // 0 dB is at 50%
    return ((gain + 12) / 24) * 100;
  };

  // Pointer drag for silky-smooth touch & mouse interactions across mobile and PC
  const updateGainFromPointer = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY;
    const offset = clientY - rect.top;
    const fraction = Math.max(0, Math.min(1, 1 - offset / rect.height));
    const rawGain = -12 + fraction * 24;
    const rounded = Math.round(rawGain * 5) / 5; // round to 0.2dB
    onBandChange(index, Math.max(-12, Math.min(12, rounded)));
  };

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setActiveBandIndex(index);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateGainFromPointer(index, e);
  };

  const handlePointerMove = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    updateGainFromPointer(index, e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl">
      {/* Header bar of the EQ section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            10-Band Graphic Equalizer (-12dB ~ +12dB)
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold">
              เบส (Bass)
            </span>
            <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
              กลาง (Mid)
            </span>
            <span className="px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-semibold">
              แหลม (Treble)
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>ลากปรับระดับบนมือถือหรือคอมพิวเตอร์ได้ทันที</span>
        </div>
      </div>

      {/* Faders Container (Horizontal scroll on narrow screens, perfectly spaced on desktop) */}
      <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
        <div className="min-w-[640px] md:min-w-0 grid grid-cols-10 gap-1.5 sm:gap-2">
          {bands.map((band, idx) => {
            const cat = getFreqCategory(band.freq);
            const fillPercent = getTrackFill(band.gain);

            return (
              <div
                key={band.id}
                id={`band-strip-${band.id}`}
                className={`flex flex-col items-center p-2 rounded-xl border select-none transition-all ${
                  activeBandIndex === idx
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700/80'
                } ${isBypassed ? 'opacity-60' : ''}`}
                onMouseEnter={() => setActiveBandIndex(idx)}
                onMouseLeave={() => {
                  if (!isDraggingRef.current) setActiveBandIndex(null);
                }}
              >
                {/* Band Category Pill */}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mb-1.5 ${cat.color}`}>
                  {cat.label}
                </span>

                {/* Gain Display */}
                <button
                  id={`band-gain-btn-${band.id}`}
                  onClick={() => onResetBand(idx)}
                  title="แตะเพื่อรีเซ็ตเป็น 0dB"
                  className={`text-xs font-mono-audio font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors ${getGainColor(
                    band.gain
                  )}`}
                >
                  {band.gain > 0 ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)}
                  <span className="text-[9px] text-slate-500 ml-0.5">dB</span>
                </button>

                {/* Fine increment button */}
                <button
                  id={`band-inc-${band.id}`}
                  onClick={() => onBandChange(idx, Math.min(12, Math.round((band.gain + 0.5) * 10) / 10))}
                  title="+0.5 dB"
                  className="w-8 h-7 mt-1 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Vertical Slider Touch/Mouse Track Container */}
                <div
                  id={`band-track-${band.id}`}
                  onPointerDown={(e) => handlePointerDown(idx, e)}
                  onPointerMove={(e) => handlePointerMove(idx, e)}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="relative h-44 sm:h-52 w-10 my-2 flex items-center justify-center cursor-ns-resize touch-none"
                >
                  {/* Background Track Groove */}
                  <div className="absolute w-2 h-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 pointer-events-none">
                    {/* 0dB center line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-500 z-10" />

                    {/* Active Fill from 0dB */}
                    {band.gain > 0 && (
                      <div
                        className="absolute w-full bg-cyan-400 rounded-full"
                        style={{
                          bottom: '50%',
                          height: `${(band.gain / 12) * 50}%`,
                        }}
                      />
                    )}
                    {band.gain < 0 && (
                      <div
                        className="absolute w-full bg-amber-400 rounded-full"
                        style={{
                          top: '50%',
                          height: `${(Math.abs(band.gain) / 12) * 50}%`,
                        }}
                      />
                    )}
                  </div>

                  {/* Tick Marks */}
                  <div className="absolute inset-y-0 -left-1 flex flex-col justify-between text-[7px] text-slate-600 font-mono-audio pointer-events-none">
                    <span>+12</span>
                    <span>+6</span>
                    <span className="text-slate-500 font-bold">0</span>
                    <span>-6</span>
                    <span>-12</span>
                  </div>

                  {/* Tactile Hardware Fader Cap */}
                  <div
                    className={`absolute w-9 h-7 rounded-md bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-slate-500 shadow-md shadow-black/80 flex items-center justify-center pointer-events-none z-20 transition-all ${
                      activeBandIndex === idx ? 'border-cyan-400 scale-105 shadow-cyan-500/20' : ''
                    }`}
                    style={{
                      bottom: `calc(${fillPercent}% - 14px)`,
                    }}
                  >
                    <div className={`w-4 h-0.5 rounded-full ${band.gain !== 0 ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-400'}`} />
                  </div>
                </div>

                {/* Fine decrement button */}
                <button
                  id={`band-dec-${band.id}`}
                  onClick={() => onBandChange(idx, Math.max(-12, Math.round((band.gain - 0.5) * 10) / 10))}
                  title="-0.5 dB"
                  className="w-8 h-7 mb-1.5 flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Band Frequency Label */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-200 font-display">
                    {band.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium text-center leading-tight truncate max-w-[55px]">
                    {band.description.split('(')[1]?.replace(')', '') || ''}
                  </span>
                </div>

                {/* Individual Reset to 0 button */}
                <button
                  id={`band-reset-mini-${band.id}`}
                  onClick={() => onResetBand(idx)}
                  title="รีเซ็ตย่านนี้เป็น 0 dB"
                  className={`mt-1 p-1 rounded hover:bg-slate-800 transition-colors ${
                    band.gain !== 0 ? 'text-slate-400 hover:text-white' : 'text-slate-700 opacity-0 hover:opacity-100'
                  }`}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
