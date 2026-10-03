/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Sparkles,
  Copy,
  Check,
  GitBranch,
  Terminal,
  FolderGit2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallExportModal: React.FC<InstallExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isWindows, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'github' | 'direct' | 'pwabuilder' | 'offline'>('github');
  const [copiedGit, setCopiedGit] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-di2bp7jypxr6ne5tex42eo-935916597562.asia-southeast1.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentAppUrl)}`;

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const copyGitCommands = () => {
    const text = `git init
git add .
git commit -m "feat: Ready for Android APK build on GitHub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/audio-equalizer.git
git push -u origin main`;
    navigator.clipboard.writeText(text);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="install-export-modal-content"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                แปลงและสร้างไฟล์ .APK / .EXE
              </h2>
              <p className="text-xs text-slate-400">
                พร้อมระบบ GitHub Actions สำหรับสร้างไฟล์ Android .APK อัตโนมัติ 100%
              </p>
            </div>
          </div>

          <button
            id="close-install-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>สร้าง APK บน GitHub (แนะนำ)</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'direct'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ติดตั้ง Native ลงเครื่อง</span>
          </button>

          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PWABuilder (.APK / .EXE)</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'offline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>คำสั่งในคอมพิวเตอร์</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

          {/* TAB 1: GITHUB ACTIONS APK BUILDER */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-cyan-950/40 to-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      GitHub Actions CI/CD พร้อมใช้งาน 100%
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      แปลงโค้ดเป็นไฟล์ .APK อัตโนมัติบน GitHub
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  ไฟล์โปรเจกต์นี้ได้รับการตั้งค่า <strong>Capacitor Android</strong> และสร้างไฟล์เวิร์กโฟลว์ <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">.github/workflows/build-apk.yml</code> ไว้เรียบร้อยแล้ว เมื่อคุณเอาโค้ดขึ้น GitHub ระบบจะคอมไพล์เป็นไฟล์ <strong>.APK พร้อมติดตั้ง</strong> ให้ดาวน์โหลดอัตโนมัติใน 2 นาที!
                </p>

                {/* Steps */}
                <div className="space-y-3 mb-4">
                  {/* Step 1 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-white mb-0.5">นำโค้ดขึ้น GitHub Repository</div>
                      <div className="text-slate-400 mb-2">
                        สร้าง Repository เปล่าบน <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">GitHub.com/new</a> จากนั้นรันคำสั่ง:
                      </div>
                      
                      <div className="relative bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono-audio text-[11px] text-slate-300 overflow-x-auto">
                        <pre className="whitespace-pre">{`git init
git add .
git commit -m "feat: Ready for Android APK build"
git branch -M main
git remote add origin https://github.com/YOUR_USER/audio-eq.git
git push -u origin main`}</pre>
                        <button
                          onClick={copyGitCommands}
                          className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedGit ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGit ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white mb-0.5">GitHub Actions จะสร้างไฟล์ APK ให้อัตโนมัติ</div>
                      <div className="text-slate-400">
                        ทันทีที่กด Push ไปที่แท็บ <strong>"Actions"</strong> ใน GitHub Repo ของคุณ จะเห็นกระบวนการ <span className="text-cyan-400 font-medium">"Build Android APK"</span> กำลังรันอยู่บนคลาวด์
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white mb-0.5">ดาวน์โหลดไฟล์ .APK ไปติดตั้งในมือถือ</div>
                      <div className="text-slate-400">
                        เมื่องานรันเสร็จ (มีเครื่องหมายถูกสีเขียว) ให้เลื่อนลงไปที่หัวข้อ <strong>"Artifacts"</strong> แล้วคลิกดาวน์โหลด <strong className="text-emerald-400">AudioEqualizer-Android-APK</strong> จะได้ไฟล์ <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">app-debug.apk</code> พร้อมติดตั้งทันที!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ready File Badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    ไฟล์ทั้งหมดในโปรเจกต์ (โฟลเดอร์ <code className="font-bold text-white">android/</code>, <code className="font-bold text-white">.github/workflows/build-apk.yml</code>, และ <code className="font-bold text-white">capacitor.config.json</code>) ถูกสร้างและตั้งค่าเรียบร้อยแล้ว
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT PWA INSTALLATION */}
          {activeTab === 'direct' && (
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ติดตั้งทันที ไม่ต้องคอมไพล์
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  ติดตั้งเป็น Native App ลงบนมือถือ หรือ คอมพิวเตอร์
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                แอปนี้รองรับเทคโนโลยี <strong>Progressive Web App (PWA)</strong> ซึ่งบน Android จะสร้างเป็น <strong>WebAPK</strong> ลงในเครื่องโดยตรง พร้อมไอคอนบนหน้าจอหลัก ทำงานแบบ Standalone เต็มหน้าจอ ปรับเสียงได้ออฟไลน์
              </p>

              {isInstalled ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>แอปนี้ถูกติดตั้งลงในอุปกรณ์ของคุณเรียบร้อยแล้ว!</span>
                </div>
              ) : isInstallable ? (
                <button
                  id="direct-pwa-install-btn"
                  onClick={handleDirectInstall}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isAndroid
                      ? 'กดเพื่อติดตั้งลงใน Android (เหมือนไฟล์ .APK)'
                      : isWindows
                      ? 'กดเพื่อติดตั้งลงใน Windows (เหมือนไฟล์ .EXE)'
                      : 'คลิกเพื่อติดตั้งแอพลงอุปกรณ์นี้ทันที'}
                  </span>
                </button>
              ) : isIOS ? (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    วิธีติดตั้งบน iPhone / iPad:
                  </div>
                  <p className="text-slate-400">
                    1. แตะปุ่ม <strong>แชร์ (Share)</strong> ที่แถบด้านล่างของ Safari<br />
                    2. เลื่อนลงมาแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)"</strong>
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    วิธีติดตั้งผ่านเบราว์เซอร์ (Chrome / Edge):
                  </div>
                  <p className="text-slate-400">
                    คลิกที่ไอคอน <strong>"ติดตั้งแอพ" (รูปหน้าจอคอมพิวเตอร์พร้อมลูกศรลง)</strong> ที่แถบ Address bar ด้านบนขวาของ Chrome หรือ Edge เพื่อสร้างไอคอนลง Desktop
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PWABUILDER */}
          {activeTab === 'pwabuilder' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  เครื่องมือ Microsoft PWABuilder
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  แปลงเป็นไฟล์ .APK (Android) และ .EXE / .MSIX (Windows)
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                คุณสามารถใช้เครื่องมือ <strong>PWABuilder (สร้างโดย Microsoft)</strong> เพื่อดาวน์โหลดแพ็กเกจไฟล์ <strong>Signed APK</strong> สำหรับติดตั้งบนโทรศัพท์ Android ทุกรุ่น หรือดาวน์โหลดไฟล์ตัวติดตั้ง <strong>Windows Package (.msix / .exe)</strong> ได้ฟรีใน 1 นาที:
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                {/* Generate Android APK */}
                <a
                  id="generate-apk-btn"
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        ดาวน์โหลดไฟล์ .APK (Android)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        สำหรับมือถือ Android ทุกรุ่น
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>

                {/* Generate Windows EXE/MSIX */}
                <a
                  id="generate-exe-btn"
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        ดาวน์โหลดไฟล์ .EXE (Windows)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ตัวติดตั้งสำหรับคอมพิวเตอร์ PC
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </a>
              </div>

              {/* URL Copy helper */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-400 block font-medium">URL ของแอปสำหรับใส่ในตัวแปลงไฟล์:</span>
                  <span className="text-xs text-cyan-400 font-mono-audio truncate block">
                    {currentAppUrl}
                  </span>
                </div>
                <button
                  id="copy-app-url-btn"
                  onClick={copyAppUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'คัดลอกแล้ว' : 'คัดลอก URL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: OFFLINE BUILD */}
          {activeTab === 'offline' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                คำสั่งสำหรับรันและคอมไพล์ในเครื่องคอมพิวเตอร์
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                หากคุณมี Android Studio หรือ Node.js ในเครื่องคอมพิวเตอร์ สามารถรันคำสั่งเหล่านี้เพื่อคอมไพล์ไฟล์ได้โดยตรง:
              </p>

              <div className="space-y-3 text-[11px] font-mono-audio bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-400 mb-1">
                    # 1. ติดตั้งแพ็กเกจและสร้างไฟล์ Build:
                  </div>
                  <div className="text-cyan-300">npm install && npm run build</div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-slate-400 mb-1">
                    # 2. คอมไพล์เป็น Android APK ด้วยคำสั่งเดียว:
                  </div>
                  <div className="text-emerald-300">npm run build:apk</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
                    *(จะได้ไฟล์ APK ในโฟลเดอร์ <code className="text-slate-400">android/app/build/outputs/apk/debug/</code>)*
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-slate-400 mb-1">
                    # 3. เปิดโปรเจกต์ใน Android Studio เพื่อรันลงโทรศัพท์โดยตรง:
                  </div>
                  <div className="text-blue-300">npm run cap:open</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            ดูรายละเอียดเพิ่มเติมในไฟล์ <code className="text-cyan-400">GITHUB_APK_GUIDE.md</code>
          </div>
          <button
            id="close-install-export-modal"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
