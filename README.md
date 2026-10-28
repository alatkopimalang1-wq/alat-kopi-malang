# 🛍️ NEXUS STORE - Toko Online Modern & Mobile Friendly

Aplikasi website toko online e-commerce modern dengan tampilan **Mobile-First Responsive**, estetika premium, mode Gelap/Terang, keranjang belanja instan, sistem checkout langsung via **WhatsApp & Web**, struk pembayaran digital, serta **Panel Manajemen Toko (Admin / Mode Penjual)**.

---

## ✨ Fitur Unggulan

### 1. 📱 Tampilan Mobile Friendly & PWA-Like
- **Mobile Bottom Navigation Bar**: Navigasi bawah ala aplikasi native (Beranda, Katalog, Favorit/Wishlist, Keranjang, dan Toko Saya).
- **Responsive 2-Column Product Grid**: Tampilan kartu produk rapi di layar smartphone (standar Shopee/Tokopedia).
- **Horizontal Category Pills**: Filter kategori geser mulus (*touch swipe friendly*).
- **Slide-in Drawers**: Drawer keranjang belanja dan favorit dengan animasi mulus dan efek *frosted glass*.

### 2. 🛒 Sistem Belanja Lengkap
- **Katalog Produk Dinamis**: Pencarian instan, filter kategori, dan pengurutan (Terpopuler, Termurah, Termahal, Rating, Nama).
- **Detail Produk Interaktif**: Pemilihan varian (warna/ukuran/spesifikasi), kuantitas stepper (+/-), dan indikator sisa stok otomatis.
- **Keranjang Belanja Real-Time**: Perhitungan subtotal otomatis, update jumlah item, dan catatan pesanan untuk penjual.
- **Sistem Voucher Diskon**: 
  - `DISKON10` (Potongan 10%)
  - `HEMAT50RB` (Potongan Rp 50.000)
  - `GRATISONGKIR` (Subsidi ongkos kirim)

### 3. 🚀 Checkout Kilat & WhatsApp Direct Order
- **Direct WhatsApp Checkout**: Menghasilkan pesan pesanan terstruktur rapi yang langsung membuka aplikasi WhatsApp Admin hanya dengan 1 klik!
- **Pilihan Metode Pembayaran**:
  - **QRIS Instan** (Scan QR m-Banking / E-Wallet)
  - **Transfer Bank** (BCA, Mandiri, BRI) dengan tombol 1-klik salin nomor rekening.
  - **E-Wallet** (GoPay, DANA, OVO, ShopeePay)
  - **COD (Bayar di Tempat)**
- **Struk / Bukti Pesanan Digital**: Dilengkapi tombol **Cetak / Simpan PDF** yang langsung siap cetak secara rapi.

### 4. 👑 Panel Admin / Mode Penjual (Toko Saya)
- **Ringkasan Statistik**: Total Pendapatan, Jumlah Pesanan, dan Total Produk Terjual.
- **Kelola Pesanan**: Melihat daftar pesanan pelanggan secara realtime, mengubah status pesanan (*Menunggu*, *Diproses*, *Dikirim*, *Selesai*), dan tombol langsung hubungi WhatsApp pembeli.
- **Kelola Produk**: Tambah produk baru dengan upload info, edit stok secara langsung, dan hapus produk.
- **Pengaturan Toko**: Ganti nama toko, nomor WhatsApp penjual, alamat pengirim, dan tarif ongkir.

---

## 📂 Struktur Berkas & Navigasi Satu Kesatuan (Unified History & Back Navigation)

Seluruh navigasi website kini terintegrasi menjadi **satu kesatuan utuh** (tanpa tab baru yang terpisah), sehingga **tombol Kembali (Back `←`) dan Maju (Forward `→`) pada browser Anda berfungsi 100% normal**:

1. **[index.html](file:///e:/COBA/index.html)**: Halaman beranda etalase toko utama & Image Slider atas.
2. **[product.html?id=...](file:///e:/COBA/product.html?id=prod-007)**: Halaman detail produk lengkap dengan tombol **`← Kembali`** (Back) dan dukungan tombol Back browser bawaan.
3. **[checkout.html](file:///e:/COBA/checkout.html)**: Halaman formulir pengiriman, keranjang belanja, voucher diskon, dan pembayaran terpadu dengan tombol **`← Kembali`**.
4. **[admin.html](file:///e:/COBA/admin.html)**: Halaman panel penjual (*Mode Toko Saya*) untuk kelola pesanan dan stok dengan tombol **`← Kembali ke Toko`**.
5. **[server.js](file:///e:/COBA/server.js)**: Server HTTP lokal Node.js port 3000.

---

## 🚀 Cara Menjalankan Website

### Opsi 1: Menggunakan Server Lokal (Sudah Aktif)
Aplikasi saat ini telah berjalan di:
👉 **[http://localhost:3000](http://localhost:3000)**

Untuk menjalankan ulang kapan saja melalui terminal / PowerShell:
```powershell
node server.js
```

### Opsi 2: Buka Langsung di Browser
Anda juga dapat membuka file `index.html` langsung dengan klik dua kali di File Explorer atau klik kanan -> *Open with Google Chrome / Microsoft Edge*.
