/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EQPreset, BandConfig } from '../types';

export const DEFAULT_BANDS: BandConfig[] = [
  { id: 0, freq: 31, label: '31Hz', gain: 0, type: 'lowshelf', q: 1.0, description: 'Sub-bass (ความถี่ต่ำลึก)' },
  { id: 1, freq: 63, label: '63Hz', gain: 0, type: 'peaking', q: 1.4, description: 'Bass (เบสหนักแน่น)' },
  { id: 2, freq: 125, label: '125Hz', gain: 0, type: 'peaking', q: 1.4, description: 'Upper Bass (กระเดื่อง/เบสหลัก)' },
  { id: 3, freq: 250, label: '250Hz', gain: 0, type: 'peaking', q: 1.4, description: 'Low Mids (ความอุ่น/ความหนา)' },
  { id: 4, freq: 500, label: '500Hz', gain: 0, type: 'peaking', q: 1.4, description: 'Mids (เสียงร้องช่วงต่ำ/เครื่องสาย)' },
  { id: 5, freq: 1000, label: '1kHz', gain: 0, type: 'peaking', q: 1.4, description: 'Center Mids (เสียงร้องหลัก/สแนร์)' },
  { id: 6, freq: 2000, label: '2kHz', gain: 0, type: 'peaking', q: 1.4, description: 'Upper Mids (ความคมชัด/Presence)' },
  { id: 7, freq: 4000, label: '4kHz', gain: 0, type: 'peaking', q: 1.4, description: 'High Mids (ความสว่าง/เสียงพยัญชนะ)' },
  { id: 8, freq: 8000, label: '8kHz', gain: 0, type: 'peaking', q: 1.4, description: 'Treble (เสียงแหลม/ฉาบแฉ)' },
  { id: 9, freq: 16000, label: '16kHz', gain: 0, type: 'highshelf', q: 1.0, description: 'Air (ความโปร่ง/ประกายเสียง)' },
];

export const BUILTIN_PRESETS: EQPreset[] = [
  {
    id: 'flat',
    name: 'Flat (Original)',
    nameTh: 'แฟลต (เสียงดั้งเดิม)',
    description: 'เสียงเดิมไม่มีการเพิ่มหรือลดความถี่ใดๆ',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    nameTh: 'เน้นเสียงเบสหนัก',
    description: 'เพิ่มย่าน Sub-bass และเบสให้ตึ้บกระหึ่ม เหมาะกับเพลงตื๊ดและปาร์ตี้',
    gains: [7, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'edm',
    name: 'EDM / Dance',
    nameTh: 'แดนซ์ / อีดีเอ็ม',
    description: 'เร่งเบสหนักและแหลมใสสว่าง ให้จังหวะคมชัดและมันส์สะใจ',
    gains: [6, 5, 3, 0, -1, 1, 3, 5, 6, 6],
  },
  {
    id: 'rock',
    name: 'Rock & Metal',
    nameTh: 'ร็อก & เมทัล',
    description: 'ดึงย่านกลางลงเล็กน้อย เพิ่มกระเดื่อง กีตาร์คมชัด และเสียงแฉกระจาย',
    gains: [5, 4, 2, -2, -3, 0, 3, 5, 6, 6],
  },
  {
    id: 'vocal',
    name: 'Vocal Clarity',
    nameTh: 'เสียงร้องคมชัด / พอดแคสต์',
    description: 'ลดความอื้ออึงของเสียงทุ้ม เพิ่มย่านเสียงคนพูดให้ฟังง่าย ชัดเจน ไม่อู้อี้',
    gains: [-3, -2, -1, 0, 2, 4, 4, 3, 1, 0],
  },
  {
    id: 'acoustic',
    name: 'Acoustic / Live',
    nameTh: 'อะคูสติก / ไลฟ์สด',
    description: 'ให้มิติเสียงธรรมชาติ อบอุ่น ฟังสบาย กีตาร์โปร่งและเครื่องดนตรีสดไพเราะ',
    gains: [3, 3, 1, 0, 1, 2, 3, 4, 4, 3],
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop & R&B',
    nameTh: 'ฮิปฮอป & อาร์แอนด์บี',
    description: 'ย่าน 808 และกระเดื่องทรงพลัง พร้อมเสียงร้องหวานละมุน',
    gains: [7, 6, 3, 1, -1, 0, 2, 1, 3, 4],
  },
  {
    id: 'jazz',
    name: 'Jazz & Blues',
    nameTh: 'แจ๊ส & บลูส์',
    description: 'ย่านกลางนุ่มนวล เบสอบอุ่น เครื่องเป่าและเสียงแซ็กโซโฟนหวานฉ่ำ',
    gains: [3, 2, 0, 1, 2, 2, 1, 2, 3, 3],
  },
  {
    id: 'classical',
    name: 'Classical',
    nameTh: 'คลาสสิก / วงออร์เคสตรา',
    description: 'สมดุลไดนามิกกว้าง มิติเสียงสมจริงเหมือนนั่งฟังในฮอลล์คอนเสิร์ต',
    gains: [4, 3, 2, 1, -1, -1, 0, 2, 3, 3],
  },
  {
    id: 'treble',
    name: 'Treble Booster',
    nameTh: 'เน้นเสียงแหลม / ใสปิ๊ง',
    description: 'เพิ่มความใส ประกายของเสียง และรายละเอียดเครื่องดนตรีชิ้นเล็กๆ',
    gains: [-2, -2, -1, 0, 0, 1, 3, 5, 7, 8],
  },
  {
    id: 'movie',
    name: 'Cinema / Dialog',
    nameTh: 'ภาพยนตร์ / เน้นบทพูด',
    description: 'คุมเสียงระเบิดไม่ให้ดังเกินไป ชูเสียงบทสนทนาตัวละครให้ชัดเจน',
    gains: [-2, -1, 0, 1, 3, 4, 3, 2, 1, 0],
  },
];

const STORAGE_KEY = 'soniceq_custom_presets_v1';

export function loadSavedPresets(): EQPreset[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved) as EQPreset[];
  } catch (e) {
    console.error('Failed to load custom presets', e);
    return [];
  }
}

export function saveCustomPreset(name: string, gains: number[]): EQPreset {
  const customPresets = loadSavedPresets();
  const newPreset: EQPreset = {
    id: `custom-${Date.now()}`,
    name,
    nameTh: name,
    description: 'พรีเซ็ตที่บันทึกไว้โดยผู้ใช้',
    isCustom: true,
    gains: [...gains],
  };
  customPresets.push(newPreset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
  return newPreset;
}

export function deleteCustomPreset(id: string): void {
  const customPresets = loadSavedPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
}
