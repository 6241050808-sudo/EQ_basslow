/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  DEFAULT_BANDS, 
  BUILTIN_PRESETS, 
  loadSavedPresets, 
  saveCustomPreset, 
  deleteCustomPreset 
} from './utils/presets';
import { audioEngine } from './utils/audioEngine';
import { BandConfig, EQPreset, AudioSourceType, DemoTrack } from './types';
import { Header } from './components/Header';
import { SpectrumVisualizer } from './components/SpectrumVisualizer';
import { BandFaders } from './components/BandFaders';
import { MasterSection } from './components/MasterSection';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { PresetModal } from './components/PresetModal';
import { InstallExportModal } from './components/InstallExportModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { 
  Sliders, 
  Info, 
  SlidersVertical, 
  Headphones, 
  Speaker, 
  Radio, 
  Layers,
  WifiOff
} from 'lucide-react';

const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'lofi',
    title: 'Lo-Fi Midnight Beats',
    artist: 'Web Audio Synthesizer',
    genre: 'Lo-Fi / Chillhop',
    bpm: 85,
  },
  {
    id: 'synthwave',
    title: 'Cyber Synthwave 80s',
    artist: 'Web Audio Synthesizer',
    genre: 'Synthwave / Retro',
    bpm: 120,
  },
  {
    id: 'bass808',
    title: 'Deep 808 Trap & Sub',
    artist: 'Web Audio Synthesizer',
    genre: 'Trap / Sub-Bass',
    bpm: 130,
  },
];

export default function App() {
  // --- EQ State ---
  const [bands, setBands] = useState<BandConfig[]>(DEFAULT_BANDS);
  const [currentPresetId, setCurrentPresetId] = useState<string>('flat');
  const [allPresets, setAllPresets] = useState<EQPreset[]>(() => [
    ...BUILTIN_PRESETS,
    ...loadSavedPresets(),
  ]);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const isOnline = useOnlineStatus();

  // --- Master Audio State ---
  const [volume, setVolume] = useState(0.85);
  const [preamp, setPreamp] = useState(0);
  const [pan, setPan] = useState(0);
  const [bassBoost, setBassBoost] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // --- Source & Playback State ---
  const [sourceType, setSourceType] = useState<AudioSourceType>('demo');
  const [selectedDemoId, setSelectedDemoId] = useState('lofi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [customFileName, setCustomFileName] = useState<string | undefined>();
  const [micActive, setMicActive] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update timer for uploaded audio file
  useEffect(() => {
    let interval: number;
    if (isPlaying && sourceType === 'file') {
      interval = window.setInterval(() => {
        const time = audioEngine.getPlaybackTime();
        setCurrentTime(time.current);
        setDuration(time.duration);
        if (time.duration > 0 && time.current >= time.duration && !isLooping) {
          setIsPlaying(false);
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, sourceType, isLooping]);

  // Handle Band Gain Change
  const handleBandGainChange = (index: number, newGain: number) => {
    const updated = [...bands];
    updated[index] = { ...updated[index], gain: newGain };
    setBands(updated);
    audioEngine.setBandGain(index, newGain);
    setCurrentPresetId('custom');
  };

  // Reset a specific band to 0dB
  const handleResetBand = (index: number) => {
    handleBandGainChange(index, 0);
  };

  // Reset all 10 bands to Flat (0dB)
  const handleResetAllBands = () => {
    const flat = bands.map((b) => ({ ...b, gain: 0 }));
    setBands(flat);
    audioEngine.setAllBands(flat.map((b) => b.gain));
    setCurrentPresetId('flat');
  };

  // Preset Selection
  const handleSelectPreset = (preset: EQPreset) => {
    setCurrentPresetId(preset.id);
    const updated = bands.map((band, idx) => ({
      ...band,
      gain: preset.gains[idx] ?? 0,
    }));
    setBands(updated);
    audioEngine.setAllBands(preset.gains);
  };

  // Save new custom preset
  const handleSaveCustomPreset = (name: string) => {
    const currentGains = bands.map((b) => b.gain);
    const saved = saveCustomPreset(name, currentGains);
    setAllPresets([...BUILTIN_PRESETS, ...loadSavedPresets()]);
    setCurrentPresetId(saved.id);
  };

  // Delete custom preset
  const handleDeleteCustomPreset = (id: string) => {
    deleteCustomPreset(id);
    setAllPresets([...BUILTIN_PRESETS, ...loadSavedPresets()]);
    if (currentPresetId === id) {
      handleSelectPreset(BUILTIN_PRESETS[0]);
    }
  };

  // Toggle Bypass (A/B comparison)
  const handleToggleBypass = () => {
    const next = !isBypassed;
    setIsBypassed(next);
    audioEngine.setBypass(next);
  };

  // Master Volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (isMuted) setIsMuted(false);
    audioEngine.setMasterVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setMasterVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setMasterVolume(0);
    }
  };

  // Preamp Gain
  const handlePreampChange = (val: number) => {
    setPreamp(val);
    audioEngine.setPreamp(val);
  };

  // Stereo Pan
  const handlePanChange = (val: number) => {
    setPan(val);
    audioEngine.setPan(val);
  };

  // Bass Boost
  const handleBassBoostChange = (val: number) => {
    setBassBoost(val);
    audioEngine.setBassBoost(val);
  };

  // Treble Boost
  const handleTrebleBoostChange = (val: number) => {
    setTrebleBoost(val);
    audioEngine.setTrebleBoost(val);
  };

  // --- Source & Playback Controls ---
  const handleTogglePlay = async () => {
    await audioEngine.resumeContext();

    if (sourceType === 'demo') {
      if (isPlaying) {
        audioEngine.stopProceduralTrack();
        setIsPlaying(false);
      } else {
        audioEngine.startProceduralTrack(selectedDemoId as 'lofi' | 'synthwave' | 'bass808');
        setIsPlaying(true);
      }
    } else if (sourceType === 'file') {
      if (isPlaying) {
        audioEngine.pauseAudio();
        setIsPlaying(false);
      } else {
        audioEngine.playAudio();
        setIsPlaying(true);
      }
    } else if (sourceType === 'mic') {
      if (micActive) {
        audioEngine.stopMic();
        setMicActive(false);
        setIsPlaying(false);
      } else {
        const ok = await audioEngine.startMic();
        if (ok) {
          setMicActive(true);
          setIsPlaying(true);
        }
      }
    }
  };

  const handleStop = () => {
    if (sourceType === 'demo') {
      audioEngine.stopProceduralTrack();
    } else if (sourceType === 'file') {
      audioEngine.pauseAudio();
      audioEngine.seekAudio(0);
      setCurrentTime(0);
    } else if (sourceType === 'mic') {
      audioEngine.stopMic();
      setMicActive(false);
    }
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioEngine.seekAudio(time);
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    audioEngine.setLoop(next);
  };

  const handleSelectDemoTrack = (id: string) => {
    setSelectedDemoId(id);
    if (sourceType === 'demo' && isPlaying) {
      audioEngine.startProceduralTrack(id as 'lofi' | 'synthwave' | 'bass808');
    }
  };

  const handleSelectSource = (type: AudioSourceType) => {
    if (type === sourceType) return;

    // Stop current playback
    handleStop();
    setSourceType(type);

    if (type === 'demo') {
      setMicActive(false);
    } else if (type === 'mic') {
      // Toggle mic
      handleToggleMic();
    }
  };

  const handleToggleMic = async () => {
    if (micActive) {
      audioEngine.stopMic();
      setMicActive(false);
      setIsPlaying(false);
    } else {
      setSourceType('mic');
      const ok = await audioEngine.startMic();
      if (ok) {
        setMicActive(true);
        setIsPlaying(true);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setSourceType('file');
      setMicActive(false);
      audioEngine.stopProceduralTrack();

      const metadata = await audioEngine.loadAudioFile(file);
      setCustomFileName(file.name);
      setDuration(metadata.duration);
      setCurrentTime(0);
      audioEngine.setLoop(isLooping);

      audioEngine.playAudio();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error loading file', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Application Header */}
      <Header
        currentPresetId={currentPresetId}
        presets={allPresets}
        onSelectPreset={handleSelectPreset}
        onResetAllBands={handleResetAllBands}
        isBypassed={isBypassed}
        onToggleBypass={handleToggleBypass}
        sourceType={sourceType}
        onSelectSource={handleSelectSource}
        micActive={micActive}
        onToggleMic={handleToggleMic}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        onOpenFilePicker={() => fileInputRef.current?.click()}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
        
        {/* GitHub APK Ready Banner */}
        <div 
          onClick={() => setIsInstallModalOpen(true)}
          className="bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group transition-all shadow-lg shadow-cyan-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>พร้อมแปลงเป็นไฟล์ .APK บน GitHub อัตโนมัติแล้ว!</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-semibold">
                  GitHub Actions Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                มีไฟล์ <code className="text-cyan-300">.github/workflows/build-apk.yml</code> และโฟลเดอร์ <code className="text-cyan-300">android/</code> ครบถ้วน แค่ push ขึ้น GitHub ก็ได้ไฟล์ .apk ทันที
              </p>
            </div>
          </div>
          <button 
            id="banner-open-apk-guide-btn"
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 text-xs font-bold border border-cyan-500/40 transition-all flex items-center gap-1.5 self-end sm:self-auto"
          >
            <span>ดูวิธีรับไฟล์ .APK</span>
            <span className="text-xs">→</span>
          </button>
        </div>

        {/* Real-time Spectrum Analyzer & Response Curve */}
        <SpectrumVisualizer
          bands={bands}
          isBypassed={isBypassed}
          isPlaying={isPlaying}
        />

        {/* 10-Band Equalizer Faders Strip */}
        <BandFaders
          bands={bands}
          onBandChange={handleBandGainChange}
          onResetBand={handleResetBand}
          isBypassed={isBypassed}
        />

        {/* Master Section & Enhancers */}
        <MasterSection
          volume={volume}
          onVolumeChange={handleVolumeChange}
          preamp={preamp}
          onPreampChange={handlePreampChange}
          pan={pan}
          onPanChange={handlePanChange}
          bassBoost={bassBoost}
          onBassBoostChange={handleBassBoostChange}
          trebleBoost={trebleBoost}
          onTrebleBoostChange={handleTrebleBoostChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* Audio Player & Transport Bar */}
        <AudioPlayerBar
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onStop={handleStop}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          isLooping={isLooping}
          onToggleLoop={handleToggleLoop}
          sourceType={sourceType}
          demoTracks={DEMO_TRACKS}
          selectedTrackId={selectedDemoId}
          onSelectDemoTrack={handleSelectDemoTrack}
          customFileName={customFileName}
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
        />

        {/* Quick Audio Guide & Acoustics Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-2">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
              <Speaker className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-1">ย่านเสียงเบส (31Hz - 125Hz)</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ควบคุมแรงกระแทกของกระเดื่องและ Sub-bass หากเสียงบวมหรืออู้อี้ ให้ลด 125Hz ลงเล็กน้อย
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-1">ย่านเสียงกลาง & ร้อง (250Hz - 2kHz)</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                หัวใจหลักของเสียงคนร้องและเครื่องสาย ปรับ 1kHz - 2kHz เพื่อเพิ่มความเด่นชัดของเนื้อเสียง
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-1">ย่านเสียงแหลม (4kHz - 16kHz)</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ความสว่างสดใส รายละเอียดฉาบแฉ และประกายเสียง Air เพิ่ม 16kHz เพื่อให้เพลงดูโปร่งกว้าง
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Preset Modal */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        presets={allPresets}
        activePresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onSavePreset={handleSaveCustomPreset}
        onDeletePreset={handleDeleteCustomPreset}
      />

      {/* Install & Export to APK / EXE Modal */}
      <InstallExportModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div 
          id="offline-banner"
          className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur border border-amber-400/50 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-xl animate-bounce"
        >
          <WifiOff className="w-4 h-4" />
          <span>โหมดออฟไลน์ — สามารถปรับ EQ และเล่นไฟล์เสียงในเครื่องได้ตามปกติ</span>
        </div>
      )}
    </div>
  );
}
