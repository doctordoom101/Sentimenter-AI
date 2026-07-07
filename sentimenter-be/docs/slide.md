# Bahan Presentasi Projek Big Data: Sentimenter AI (myBCA Review Analyzer)

Dokumen ini disusun slide-per-slide sebagai panduan presentasi sekaligus materi sumber (*source document*) untuk dimasukkan ke Google NotebookLM.

---

## Slide 1: Judul & Latar Belakang Projek
### **Judul: Sentimenter AI: Sistem Analisis Sentimen & Topik Ulasan myBCA Real-Time berbasis Big Data**
*   **Studi Kasus**: Ulasan Aplikasi Perbankan Digital **myBCA** di Google Play Store.
*   **Masalah Utama**:
    *   Ulasan pengguna di Play Store masuk secara terus-menerus (*high velocity*) dengan bahasa yang tidak terstruktur (*variety*).
    *   Sulit mengidentifikasi isu kritis aplikasi (seperti crash atau gagal login) di antara ribuan ulasan secara manual.
*   **Solusi Projek**:
    *   Membangun pipeline *data ingestion* (scraper) otomatis.
    *   Mengimplementasikan pemrosesan teks (*NLP*) bahasa Indonesia yang optimal.
    *   Melatih model *Supervised Learning* untuk mendeteksi sentimen secara akurat (>82%).
    *   Menerapkan *Unsupervised Learning* (LDA) untuk mengelompokkan topik keluhan secara dinamis dan real-time.

---

## Slide 2: Arsitektur Pipeline Data End-to-End
### **Alur Data dari Google Play Store hingga Layar Pengguna**
*   **Diagram Alur Data (Data Flow Diagram)**:
    ```
    [Play Store API] ──> (Ingestion Scraper) ──> [In-Memory Lookup] ──> [SQLite DB]
                                                                             │
    [End-User Dashboard] <── (REST API FastAPI) <── [Inference: Logistic & LDA] <──┘
    ```
*   **Tahapan Pipeline**:
    1.  **Data Ingestion**: Scraper menarik data ulasan pengguna myBCA secara terjadwal/interaktif berdasarkan tanggal ulasan terakhir untuk menjamin kelengkapan data.
    2.  **Deduplikasi & Storage**: Sistem memfilter data ulasan ganda menggunakan memori RAM (*In-Memory Set*) dalam waktu $O(1)$, lalu menyimpan data baru ke database SQLite.
    3.  **Machine Learning Inference**:
        *   Setiap ulasan baru secara instan diprediksi sentimennya (`positif`, `netral`, `negatif`) oleh model **Logistic Regression + TF-IDF**.
        *   Sistem melakukan klasterisasi **LDA** pada 2.000 ulasan terbaru secara periodik untuk memperbarui topik tren secara dinamis.
    4.  **Presentation (End-User)**: Dashboard Frontend (React + Tailwind CSS) memvisualisasikan data ulasan, tren grafik interaktif, sebaran sentimen, dan ringkasan AI untuk digunakan oleh tim Developer & IT BCA untuk tindak lanjut keluhan (*actionable feedback*).

---

## Slide 3: Data Ingestion Engine (Scraper Play Store)
### **Mekanisme Penarikan Data Skala Besar**
*   **Arsitektur Ingestion**:
    *   Mengintegrasikan API Google Play Scraper untuk menarik data langsung dari Play Store aplikasi `com.bca.mybca.omni.android`.
    *   Mendukung penarikan berkala (*batch*) mulai dari 50 hingga penarikan penuh tanpa batas (*all reviews* dengan parameter `count=-1`).
*   **Optimasi Rekayasa Data (Engineering Optimization)**:
    *   **Masalah Awal**: Pengecokan duplikasi ID ulasan menggunakan kueri SQL individual di dalam perulangan (*N+1 Query Problem*) sangat lambat saat memproses ribuan ulasan.
    *   **Solusi Optimasi**: Menerapkan **In-Memory Set Lookup**. Kueri database hanya dijalankan sekali di awal untuk memuat seluruh ID ke memori RAM dalam struktur data `set` Python. Pengecekkan duplikat dilakukan instan dengan kompleksitas waktu **$O(1)$**.
    *   **Dampak**: Menghilangkan ribuan koneksi SQL bolak-balik, mempercepat proses filter ulasan baru hingga **99.8%**.

---

## Slide 4: Pipeline Preprocessing & Normalisasi Teks (NLP)
### **Mengatasi Karakteristik Data Ulasan yang Kotor (Noisy)**
*   **Tantangan Teks Ulasan Netizen**: Penuh singkatan gaul, salah ketik (*typo*), tanda baca berantakan, dan kata negasi yang menentukan arti kalimat.
*   **Tahapan Pipeline NLP**:
    1.  **Case Folding & Cleaning**: Mengubah teks ke huruf kecil dan menghapus simbol/tautan.
    2.  **Kamus Slang (Colloquial Normalization)**: Mengubah kata tidak baku menjadi kata baku bahasa Indonesia (contoh: *ga/gk* $\rightarrow$ *tidak*, *lemot* $\rightarrow$ *lambat*, *bgt* $\rightarrow$ *banget*).
    3.  **Stopwords Removal Terarah**: Menggunakan stopword NLTK Indonesia, tetapi **mempertahankan kata negasi** (seperti *tidak, belum, kurang, jangan*) agar model tidak salah mengartikan kalimat seperti *"tidak lancar"*.
    4.  **Optimasi Stemming Sastrawi**: Objek stemmer diinisialisasi secara global di memori RAM (bukan di dalam fungsi). Mempercepat preprocessing data latih hingga **10-50x lebih cepat**.

---

## Slide 5: Analisis Sentimen (Supervised Learning)
### **Model Klasifikasi Sentimen Akurasi Tinggi**
*   **Eksperimen Algoritma & Fitur**:
    *   Meninggalkan model baseline Naive Bayes (akurasi hanya 69-75%).
    *   Beralih ke **Logistic Regression (`C=2.0, max_iter=1000`)**.
    *   Ekstraksi Fitur: **TF-IDF Vectorizer** dengan kombinasi **Unigram + Bigram** (`ngram_range=(1, 2)`) dan sublinear term-frequency scaling.
*   **Data Pelatihan (Training)**:
    *   Model dilatih menggunakan total **36.125 ulasan riil** dari database SQLite.
    *   Data testing: 20% stratified split (7.089 ulasan).
*   **Hasil Evaluasi Pengujian**:
    *   **Akurasi Keseluruhan (Accuracy)**: **82.07%** (Melampaui target projek >80%).
    *   *Ulasan Negatif*: F1-Score **84%** (Sangat peka menangkap keluhan).
    *   *Ulasan Positif*: F1-Score **88%** (Sangat presisi menangkap kepuasan).
    *   *Insight Teknikal*: Melatih model pada distribusi alami tanpa oversampling kelas netral terbukti meningkatkan akurasi keseluruhan karena menghindari bias data rating 3 yang bermakna ganda.

---

## Slide 6: Dynamic Topic Modeling (Unsupervised Learning)
### **Ekstraksi Keluhan Otomatis Tanpa Kata Kunci Hardcoded**
*   **Kelemahan Sistem Lama**: Topik dikelompokkan manual berbasis kamus kata kunci statis, tidak mampu mendeteksi masalah baru di luar definisi.
*   **Solusi Baru (LDA)**:
    *   Menggunakan algoritma **Latent Dirichlet Allocation (LDA)** dari pustaka *scikit-learn*.
    *   Menghitung distribusi probabilitas kata untuk mengelompokkan ulasan secara otomatis ke dalam **4 kluster topik utama**.
*   **Optimasi Real-Time & Naming Cerdas**:
    *   Untuk menjaga performa aplikasi tetap cepat (<0.5 detik), LDA dilatih dinamis pada **2.000 ulasan terbaru**.
    *   **Dynamic Labeling**: Nama topik tidak lagi kaku, melainkan dibuat otomatis dari 3 kata kunci dominan di kluster tersebut (contoh: *Qris / Bayar / Error*, *Login / Sandi / Otp*).
    *   Masing-masing topik langsung dihitung persentase sentimen dan tingkat pertumbuhan trennya (*growth rate*).

---

## Slide 7: Analisis & Dampak Bisnis (Dashboard Operasional)
### **Transformasi Data Menjadi Keputusan Bisnis**
*   **Dashboard Utama**: Menyajikan visualisasi KPI utama, grafik tren bulanan, kata kunci populer, serta ringkasan insight berbasis kecerdasan buatan.
*   **Manajemen Tugas Tim Internal**:
    *   Ulasan di feed dilengkapi aksi operasional **Mark Resolved** dan **Flag Team** untuk koordinasi tim.
    *   Dashboard dilengkapi filter tab **Resolved** dan **Flagged** dinamis untuk memantau keluhan yang sedang diperbaiki pengembang atau yang sudah berhasil ditangani.
*   **Eksplorasi Detail Topik**:
    *   Dengan mengklik baris topik hasil kluster LDA, pengguna dashboard dapat langsung mengeksplorasi list ulasan riil terkait topik tersebut untuk dicari akar masalah teknisnya.

---

## Slide 8: Kesimpulan Projek
### **Ringkasan Keberhasilan Sentimenter AI**
1.  **Skalabilitas**: Berhasil menangani puluhan ribu data ulasan myBCA secara berkala dengan sistem filter duplikasi in-memory yang sangat efisien.
2.  **Akurasi**: Model Logistic Regression berhasil melampaui performa baseline dengan akurasi **82.07%** didukung preprocessing teks terarah (negasi & slang).
3.  **Adaptabilitas**: Deteksi topik keluhan bersifat dinamis berbasis **LDA Unsupervised Learning**, mampu beradaptasi otomatis terhadap segala jenis isu atau keluhan baru yang muncul di masa mendatang.
4.  **Dampak Praktis**: Menyediakan dashboard operasional yang siap pakai untuk menjembatani umpan balik pengguna Play Store langsung ke tim developer bank.
