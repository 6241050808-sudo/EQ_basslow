/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { BandConfig } from '../types';
import { Activity, Volume2 } from 'lucide-react';

interface SpectrumVisualizerProps {
  bands: BandConfig[];
  isBypassed: boolean;
  isPlaying: boolean;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  bands,
  isBypassed,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [meterL, setMeterL] = useState(0);
  const [meterR, setMeterR] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [displayMode, setDisplayMode] = useState<'bars' | 'wave'>('bars');

  // Animation loop
  useEffect(() => {
    let animFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Peak decay tracking for VU meters
    let currentPeakL = 0;
    let currentPeakR = 0;

    // Precalculate frequency points for the mathematical EQ curve (20Hz to 20kHz logarithmic)
    const curvePointsCount = 180;
    const frequencies = new Float32Array(curvePointsCount);
    const minFreq = 20;
    const maxFreq = 20000;
    for (let i = 0; i < curvePointsCount; i++) {
      const fraction = i / (curvePointsCount - 1);
      frequencies[i] = minFreq * Math.pow(maxFreq / minFreq, fraction);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas with dark gradient
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // --- Draw Horizontal dB Lines ---
      const dbLevels = [12, 6, 0, -6, -12];
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';

      dbLevels.forEach((db) => {
        // Map dB (-15 to +15 dB) to y
        const y = height / 2 - (db / 15) * (height / 2 - 14);
        ctx.strokeStyle = db === 0 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(51, 65, 85, 0.25)';
        ctx.lineWidth = db === 0 ? 1.5 : 1;
        ctx.setLineDash(db === 0 ? [] : [3, 4]);

        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(width - 15, y);
        ctx.stroke();

        ctx.fillStyle = db === 0 ? '#38bdf8' : '#64748b';
        ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 30, y + 3);
      });
      ctx.setLineDash([]);

      // --- Draw Vertical Frequency Markers ---
      const freqMarkers = [
        { f: 31, l: '31' },
        { f: 63, l: '63' },
        { f: 125, l: '125' },
        { f: 250, l: '250' },
        { f: 500, l: '500' },
        { f: 1000, l: '1k' },
        { f: 2000, l: '2k' },
        { f: 4000, l: '4k' },
        { f: 8000, l: '8k' },
        { f: 16000, l: '16k' },
      ];

      ctx.textAlign = 'center';
      freqMarkers.forEach((marker) => {
        const xFraction = Math.log10(marker.f / minFreq) / Math.log10(maxFreq / minFreq);
        const x = 35 + xFraction * (width - 50);

        ctx.strokeStyle = 'rgba(51, 65, 85, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, height - 16);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.fillText(marker.l, x, height - 4);
      });

      // --- Draw Real-time FFT Frequency Spectrum ---
      const { freqData, peakL, peakR, isClipping: clip } = audioEngine.getAnalyserData();

      // Smooth VU meter peak values
      currentPeakL = Math.max(peakL, currentPeakL * 0.93);
      currentPeakR = Math.max(peakR, currentPeakR * 0.93);
      setMeterL(currentPeakL);
      setMeterR(currentPeakR);
      setIsClipping(clip);

      if (freqData && freqData.length > 0) {
        const binCount = freqData.length;
        const usefulBins = Math.floor(binCount * 0.7); // Focus on human audible spectrum

        if (displayMode === 'bars') {
          const barCount = 56;
          const barWidth = Math.max(2, (width - 55) / barCount - 2);

          for (let b = 0; b < barCount; b++) {
            // Logarithmic mapping of bin index
            const binIdx = Math.floor(Math.pow(b / barCount, 2.2) * usefulBins);
            const val = freqData[Math.min(usefulBins - 1, binIdx)] || 0;
            const normalizedHeight = (val / 255) * (height - 35);

            const x = 38 + b * (barWidth + 2);
            const y = height - 18 - normalizedHeight;

            // Gradient for spectrum bars
            const barGrad = ctx.createLinearGradient(0, y, 0, height - 18);
            if (isBypassed) {
              barGrad.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
              barGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
            } else {
              barGrad.addColorStop(0, 'rgba(34, 211, 238, 0.85)');
              barGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
              barGrad.addColorStop(1, 'rgba(147, 51, 234, 0.05)');
            }

            ctx.fillStyle = barGrad;
            ctx.fillRect(x, y, barWidth, normalizedHeight);

            // Small glowing peak head
            if (normalizedHeight > 3) {
              ctx.fillStyle = isBypassed ? '#fde68a' : '#a5f3fc';
              ctx.fillRect(x, y - 1.5, barWidth, 2);
            }
          }
        } else {
          // Smooth Waveform Spectrum Fill
          ctx.beginPath();
          ctx.moveTo(38, height - 18);

          for (let i = 0; i < usefulBins; i += 4) {
            const fraction = i / usefulBins;
            const x = 38 + fraction * (width - 55);
            const val = freqData[i] || 0;
            const y = height - 18 - (val / 255) * (height - 35);
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width - 15, height - 18);
          ctx.closePath();

          const waveGrad = ctx.createLinearGradient(0, 0, 0, height - 18);
          waveGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
          waveGrad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
          ctx.fillStyle = waveGrad;
          ctx.fill();

          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // --- Draw Mathematical EQ Transfer Function Curve ---
      if (!isBypassed) {
        const responseDbs = audioEngine.getOverallFrequencyResponse(frequencies);

        ctx.beginPath();
        let firstPoint = true;

        for (let i = 0; i < curvePointsCount; i++) {
          const f = frequencies[i];
          const db = responseDbs[i];

          const xFraction = Math.log10(f / minFreq) / Math.log10(maxFreq / minFreq);
          const x = 35 + xFraction * (width - 50);

          // Map dB (-15 to +15 dB) to y coordinate
          const clampedDb = Math.max(-15, Math.min(15, db));
          const y = height / 2 - (clampedDb / 15) * (height / 2 - 14);

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Glowing EQ response line
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw dots at each of the 10 bands
        bands.forEach((band) => {
          const xFraction = Math.log10(band.freq / minFreq) / Math.log10(maxFreq / minFreq);
          const x = 35 + xFraction * (width - 50);
          const y = height / 2 - (band.gain / 15) * (height / 2 - 14);

          ctx.fillStyle = band.gain !== 0 ? '#38bdf8' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(x, y, band.gain !== 0 ? 4 : 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [bands, isBypassed, displayMode]);

  // Responsive Canvas Size handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden">
      {/* Top Header info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real-time FFT Spectrum & EQ Response Curve
          </span>
          {isPlaying && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Visualizer Mode Toggle */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              id="viz-bars-btn"
              onClick={() => setDisplayMode('bars')}
              className={`px-2 py-0.5 rounded ${
                displayMode === 'bars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              แท่งสเปกตรัม
            </button>
            <button
              id="viz-wave-btn"
              onClick={() => setDisplayMode('wave')}
              className={`px-2 py-0.5 rounded ${
                displayMode === 'wave' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              คลื่นเสียง
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Canvas + Master Stereo Meter Container */}
      <div className="flex gap-2 sm:gap-3 items-stretch">
        {/* Main Spectrum Canvas */}
        <div ref={containerRef} className="flex-1 h-44 sm:h-52 relative rounded-xl overflow-hidden border border-slate-800/80">
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          {/* Curve legend / status watermark */}
          <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-3 text-[10px] bg-slate-950/60 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-800/60 font-mono-audio">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full"></span>
              <span className="text-slate-300">EQ Curve (20Hz - 20kHz)</span>
            </div>
            {isBypassed && (
              <span className="text-amber-400 font-bold">BYPASS ON</span>
            )}
          </div>
        </div>

        {/* Dual Channel Peak Meters (L & R) */}
        <div className="w-12 sm:w-14 bg-slate-950/90 rounded-xl border border-slate-800/80 p-2 flex flex-col justify-between items-center text-[10px] font-mono-audio select-none">
          {/* Clip LED indicator */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-bold mb-0.5">CLIP</span>
            <div
              className={`w-3.5 h-2 rounded-sm border transition-colors ${
                isClipping
                  ? 'bg-rose-500 border-rose-400 shadow-md shadow-rose-500/50 animate-pulse'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          </div>

          {/* Vertical VU level bars */}
          <div className="flex gap-1.5 h-28 sm:h-32 my-1 items-end">
            {/* L Channel */}
            <div className="w-2.5 h-full bg-slate-900 rounded-sm relative overflow-hidden flex flex-col justify-end border border-slate-800">
              <div
                className="w-full transition-all duration-75 ease-out rounded-sm"
                style={{
                  height: `${Math.min(100, meterL * 100)}%`,
                  background: 'linear-gradient(to top, #10b981 0%, #10b981 65%, #f59e0b 80%, #ef4444 100%)',
                }}
              />
            </div>

            {/* R Channel */}
            <div className="w-2.5 h-full bg-slate-900 rounded-sm relative overflow-hidden flex flex-col justify-end border border-slate-800">
              <div
                className="w-full transition-all duration-75 ease-out rounded-sm"
                style={{
                  height: `${Math.min(100, meterR * 100)}%`,
                  background: 'linear-gradient(to top, #10b981 0%, #10b981 65%, #f59e0b 80%, #ef4444 100%)',
                }}
              />
            </div>
          </div>

          {/* Channel labels */}
          <div className="flex gap-2 text-[10px] text-slate-400 font-bold">
            <span>L</span>
            <span>R</span>
          </div>
        </div>
      </div>
    </div>
  );
};
