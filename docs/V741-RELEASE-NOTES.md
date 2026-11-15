# WellnessHubID V7.41 — Future Map Discipline Hub

## Perubahan utama
- Menambahkan slide **Future Map** di halaman Progress Discipline Hub.
- Future Vision dapat diedit: tujuan, target waktu, prioritas, alasan, milestone, dan durasi milestone.
- Tombol **Perbarui Otomatis / Auto Sync** membaca data lokal Discipline Hub: DP, streak, misi selesai, kondisi, dan jadwal.
- Menambahkan infografik empat arah: Tubuh, Disiplin, Produktivitas, dan Kehidupan Pribadi.
- Menambahkan roadmap Sekarang → 30 Hari → 3 Bulan → target utama.
- Menambahkan milestone terdekat dan daftar misi pendukung.
- Menambahkan notebook dengan Reflection, Idea, Decision, pin, pencarian, filter, edit, dan hapus.
- Seluruh data tersimpan lokal di browser melalui `localStorage` (`dh_future_map_v741`).
- Slide Vault berpindah dari index 4 ke index 5. Shortcut Vault sudah disesuaikan.
- Cache service worker dinaikkan ke `wellnesshubid-v741-future-map`.

## File yang berubah
- `app.html`
- `service-worker.js`
- `assets/future-map-vision-v741.webp`

## Instalasi PATCH
1. Backup project yang sedang aktif.
2. Replace `app.html` dan `service-worker.js` di root project.
3. Salin `assets/future-map-vision-v741.webp` ke folder `assets/`.
4. Deploy dengan opsi clear cache.
5. Tutup tab lama lalu buka ulang agar service worker V7.41 aktif.

## Batasan sistem otomatis
Skor Future Map adalah **indikator arah kebiasaan**, bukan diagnosis kesehatan dan bukan penilaian nilai hidup. Perhitungan memakai data lokal yang tersedia di Discipline Hub.
