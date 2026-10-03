/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Repeat, 
  Upload, 
  Music, 
  Headphones, 
  Radio,
  FileAudio
} from 'lucide-react';
import { AudioSourceType, DemoTrack } from '../types';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  sourceType: AudioSourceType;
  demoTracks: DemoTrack[];
  selectedTrackId: string;
  onSelectDemoTrack: (id: string) => void;
  customFileName?: string;
  onFileUpload: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStop,
  currentTime,
  duration,
  onSeek,
  isLooping,
  onToggleLoop,
  sourceType,
  demoTracks,
  selectedTrackId,
  onSelectDemoTrack,
  customFileName,
  onFileUpload,
  fileInputRef,
}) => {
  const currentDemo = demoTracks.find((t) => t.id === selectedTrackId);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
        onFileUpload(file);
      }
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        
        {/* Track Metadata & Status */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 flex-shrink-0">
            {sourceType === 'file' ? (
              <FileAudio className="w-6 h-6" />
            ) : sourceType === 'mic' ? (
              <Radio className="w-6 h-6 animate-pulse text-rose-300" />
            ) : (
              <Headphones className="w-6 h-6" />
            )}
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs font-display">
                {sourceType === 'file'
                  ? customFileName || 'ไฟล์เสียงที่อัปโหลด'
                  : sourceType === 'mic'
                  ? 'เสียงสดจากไมโครโฟน (Live Input)'
                  : currentDemo?.title || 'Lo-Fi Chill Beat'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-semibold border border-slate-700 uppercase">
                {sourceType === 'file' ? 'Uploaded' : sourceType === 'mic' ? 'Live Mic' : currentDemo?.genre || 'Demo'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {sourceType === 'file'
                ? 'เล่นไฟล์เพลงส่วนตัวของคุณ พร้อมแสดงคลื่นความถี่'
                : sourceType === 'mic'
                ? 'พูด ร้อง หรือต่อเครื่องดนตรี เพื่อทดสอบ EQ ได้แบบเรียลไทม์'
                : `เพลงตัวอย่างระบบ Web Audio Synth • ${currentDemo?.bpm || 85} BPM`}
            </p>
          </div>
        </div>

        {/* Demo Tracks Picker (if demo source is active) */}
        {sourceType === 'demo' && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            {demoTracks.map((track) => (
              <button
                key={track.id}
                id={`demo-track-${track.id}`}
                onClick={() => onSelectDemoTrack(track.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTrackId === track.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{track.title}</span>
                <span className="text-[10px] opacity-75 ml-1">({track.bpm}bpm)</span>
              </button>
            ))}
          </div>
        )}

        {/* Transport Controls (Play, Pause, Stop, Loop) */}
        <div className="flex items-center gap-3 justify-end">
          {/* Loop toggle for files */}
          {sourceType === 'file' && (
            <button
              id="loop-toggle-btn"
              onClick={onToggleLoop}
              title={isLooping ? 'วนซ้ำ (เปิดอยู่)' : 'วนซ้ำ (ปิดอยู่)'}
              className={`p-2.5 rounded-xl border transition-colors ${
                isLooping
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          )}

          {/* Stop Button */}
          <button
            id="audio-stop-btn"
            onClick={onStop}
            title="หยุดการเล่น"
            className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Play / Pause Big Button */}
          <button
            id="audio-play-pause-btn"
            onClick={onTogglePlay}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>หยุดชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{sourceType === 'mic' ? 'เปิดฟังสด' : 'เริ่มเล่นเพลง'}</span>
              </>
            )}
          </button>

          {/* Upload Button */}
          <button
            id="upload-track-btn"
            onClick={() => fileInputRef.current?.click()}
            title="อัปโหลดเพลงของคุณ (MP3, WAV, FLAC, M4A)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>อัปโหลด</span>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>

      </div>

      {/* Progress timeline scrubber for uploaded audio files */}
      {sourceType === 'file' && duration > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-3">
          <span className="text-[11px] font-mono-audio text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            id="audio-timeline-scrubber"
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <span className="text-[11px] font-mono-audio text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      )}
    </div>
  );
};
