/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EQPreset } from '../types';
import { 
  X, 
  Bookmark, 
  Plus, 
  Trash2, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: EQPreset[];
  activePresetId: string;
  onSelectPreset: (preset: EQPreset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  presets,
  activePresetId,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
}) => {
  const [newPresetName, setNewPresetName] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim());
    setNewPresetName('');
  };

  const builtin = presets.filter((p) => !p.isCustom);
  const custom = presets.filter((p) => p.isCustom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="preset-modal-content"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">จัดการพรีเซ็ตเสียง (EQ Presets)</h2>
              <p className="text-xs text-slate-400">เลือกโปรไฟล์เสียงหรือบันทึกค่าที่ปรับไว้เป็นพรีเซ็ตของคุณเอง</p>
            </div>
          </div>

          <button
            id="preset-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Save Current EQ Form */}
          <form onSubmit={handleSave} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
            <label htmlFor="custom-preset-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              บันทึกค่าเสียงปัจจุบันเป็นพรีเซ็ตใหม่
            </label>
            <div className="flex gap-2">
              <input
                id="custom-preset-input"
                type="text"
                placeholder="เช่น หูฟังตัวโปรด, เบสแน่นในรถ, ฟังกลางคืน..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                id="save-custom-preset-btn"
                type="submit"
                disabled={!newPresetName.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึก</span>
              </button>
            </div>
          </form>

          {/* Custom Presets Section */}
          {custom.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  พรีเซ็ตของคุณ ({custom.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {custom.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <button
                        id={`select-custom-preset-${preset.id}`}
                        onClick={() => {
                          onSelectPreset(preset);
                          onClose();
                        }}
                        className="flex-1 text-left flex items-start gap-2.5"
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          {isActive ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            กำหนดเอง
                          </span>
                        </div>
                      </button>

                      <button
                        id={`delete-custom-preset-${preset.id}`}
                        onClick={() => onDeletePreset(preset.id)}
                        title="ลบพรีเซ็ตนี้"
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Built-in Presets Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                พรีเซ็ตมาตรฐานจากสตูดิโอ ({builtin.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {builtin.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`select-builtin-preset-${preset.id}`}
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg mt-0.5 ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {isActive ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {preset.nameTh}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono-audio">
                          {preset.name.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            id="preset-modal-done-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
