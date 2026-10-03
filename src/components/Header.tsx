/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SlidersVertical, 
  RotateCcw, 
  Mic, 
  MicOff, 
  Upload, 
  Sparkles, 
  BookmarkCheck,
  Power,
  Download
} from 'lucide-react';
import { AudioSourceType, EQPreset } from '../types';

interface HeaderProps {
  currentPresetId: string;
  presets: EQPreset[];
  onSelectPreset: (preset: EQPreset) => void;
  onResetAllBands: () => void;
  isBypassed: boolean;
  onToggleBypass: () => void;
  sourceType: AudioSourceType;
  onSelectSource: (type: AudioSourceType) => void;
  micActive: boolean;
  onToggleMic: () => void;
  onOpenPresetModal: () => void;
  onOpenFilePicker: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  presets,
  onSelectPreset,
  onResetAllBands,
  isBypassed,
  onToggleBypass,
  sourceType,
  onSelectSource,
  micActive,
  onToggleMic,
  onOpenPresetModal,
  onOpenFilePicker,
  onOpenInstallModal,
}) => {
  const currentPreset = presets.find((p) => p.id === currentPresetId);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <SlidersVertical className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-display">AUDIO EQUALIZER</h1>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                  isBypassed 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                }`}>
                  {isBypassed ? 'EQ Bypassed' : 'DSP Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบปรับแต่งย่านความถี่เสียง 10-Band Graphic DSP & Real-time Analyzer
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="open-install-modal-mobile-btn"
              onClick={onOpenInstallModal}
              title="ติดตั้ง / ดาวน์โหลด .APK"
              className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.APK</span>
            </button>

            <button
              id="bypass-toggle-mobile"
              onClick={onToggleBypass}
              title={isBypassed ? 'เปิดใช้งาน EQ' : 'ข้ามการทำงาน EQ (ฟังเสียงต้นฉบับ)'}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isBypassed
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isBypassed ? 'BYPASS' : 'EQ ON'}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Audio Source Selector */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="source-demo-btn"
              onClick={() => onSelectSource('demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                sourceType === 'demo'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เพลงตัวอย่าง</span>
            </button>

            <button
              id="source-file-btn"
              onClick={() => {
                onSelectSource('file');
                onOpenFilePicker();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                sourceType === 'file'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>เปิดไฟล์เสียง</span>
            </button>

            <button
              id="source-mic-btn"
              onClick={onToggleMic}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                micActive
                  ? 'bg-rose-500 text-white font-bold animate-pulse shadow-sm shadow-rose-500/30'
                  : sourceType === 'mic'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{micActive ? 'ไมค์ทำงาน' : 'ไมโครโฟน'}</span>
            </button>
          </div>

          {/* Preset Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1">
            <BookmarkCheck className="w-4 h-4 text-cyan-400" />
            <select
              id="preset-dropdown-select"
              value={currentPreset?.id || 'flat'}
              onChange={(e) => {
                const found = presets.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer py-1 pr-1"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
                  {preset.nameTh} {preset.isCustom ? '★' : ''}
                </option>
              ))}
            </select>

            <button
              id="preset-manage-btn"
              onClick={onOpenPresetModal}
              title="จัดการและบันทึกพรีเซ็ต"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-1.5 py-0.5 rounded hover:bg-cyan-500/10 transition-colors"
            >
              พรีเซ็ต
            </button>
          </div>

          {/* Desktop Bypass Switch */}
          <button
            id="bypass-toggle-desktop"
            onClick={onToggleBypass}
            title={isBypassed ? 'เปิดใช้งาน EQ' : 'ข้ามการทำงาน EQ (ฟังเสียงดิบเพื่อเปรียบเทียบ A/B)'}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isBypassed
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isBypassed ? 'BYPASSED' : 'EQ BYPASS'}</span>
          </button>

          {/* Reset Bands to Flat */}
          <button
            id="reset-bands-btn"
            onClick={onResetAllBands}
            title="รีเซ็ตย่านความถี่ทั้งหมดเป็น 0dB (Flat)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">รีเซ็ต</span>
            <span>0 dB</span>
          </button>

          {/* Install / Export APK & EXE button */}
          <button
            id="open-install-modal-header-btn"
            onClick={onOpenInstallModal}
            title="สร้างไฟล์ .APK บน GitHub หรือติดตั้งแอพ"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/25 to-blue-600/25 hover:from-cyan-500/35 hover:to-blue-600/35 border border-cyan-400/50 text-xs font-bold text-cyan-300 hover:text-white shadow-md shadow-cyan-500/10 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>สร้างไฟล์ .APK (GitHub)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
