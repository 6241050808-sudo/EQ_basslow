# คู่มือการแปลงเป็นไฟล์ .APK ผ่าน GitHub (พร้อมใช้งาน 100%)

โปรเจกต์นี้ได้รับการตั้งค่าโครงสร้าง **Capacitor Android** และระบบ **GitHub Actions Workflow** เรียบร้อยแล้ว เมื่อนำโค้ดขึ้น GitHub ระบบจะแปลงและคอมไพล์เป็นไฟล์ `.apk` ให้คุณดาวน์โหลดอัตโนมัติ โดยไม่ต้องติดตั้ง Android Studio ในคอมพิวเตอร์ของคุณเอง!

---

## 🚀 ขั้นตอนที่ 1: นำโค้ดขึ้น GitHub

1. สร้าง Repository ใหม่บน [GitHub.com](https://github.com/new) (ตั้งชื่อเช่น `audio-equalizer-app`)
2. เปิด Terminal ในโฟลเดอร์โปรเจกต์นี้ แล้วรันคำสั่ง:

```bash
git init
git add .
git commit -m "feat: Add Android Capacitor and GitHub Actions APK builder"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/audio-equalizer-app.git
git push -u origin main
```
*(แทนที่ `YOUR_USERNAME/audio-equalizer-app` ด้วย URL ของคุณ)*

---

## ⚡ ขั้นตอนที่ 2: GitHub จะสร้างไฟล์ .APK ให้อัตโนมัติทันที

1. เมื่อคุณ `git push` ขึ้น GitHub สำเร็จ ระบบ **GitHub Actions** จะเริ่มทำงานทันทีโดยอัตโนมัติ (อ่านค่าจากไฟล์ `.github/workflows/build-apk.yml`)
2. ไปที่หน้า GitHub Repository ของคุณ แล้วคลิกแท็บ **Actions** ด้านบน
3. คุณจะเห็นขั้นตอน **"Build Android APK"** กำลังประมวลผล (ใช้เวลาประมาณ 2-3 นาที)

---

## 📥 ขั้นตอนที่ 3: ดาวน์โหลดไฟล์ .APK ไปติดตั้งในมือถือ

1. เมื่อกระบวนการสร้างเสร็จสมบูรณ์ จะมีเครื่องหมายถูกสีเขียว (✅)
2. คลิกเข้าไปที่งาน **"Build Android APK"** ที่รันสำเร็จ
3. เลื่อนลงมาด้านล่างสุดที่หัวข้อ **Artifacts**
4. คลิกดาวน์โหลดไฟล์ **`AudioEqualizer-Android-APK`**
5. แตกไฟล์ ZIP ที่ดาวน์โหลดมา จะได้ไฟล์ `app-debug.apk`
6. ส่งไฟล์เข้าโทรศัพท์ Android แล้วกดติดตั้ง (Install) ใช้งานได้ทันที!

---

## 🛠️ โครงสร้างไฟล์สำหรับ Android ในโปรเจกต์นี้

- 📂 `.github/workflows/build-apk.yml` — ระบบสั่งคอมไพล์ APK อัตโนมัติบน GitHub Cloud
- 📂 `android/` — โฟลเดอร์เนทีฟโปรเจกต์ Android (Gradle, Manifest, Java/Kotlin)
- 📄 `capacitor.config.json` — การตั้งค่า App ID (`com.audioequalizer.app`) และชื่อแอป
- 📄 `package.json` — สคริปต์สำหรับรันและซิงค์ Android
