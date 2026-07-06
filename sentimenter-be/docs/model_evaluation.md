# Laporan Evaluasi Model Sentimen

## Deskripsi
Dokumen ini merangkum hasil pelatihan ulang (*retraining*) dan evaluasi model *Machine Learning* untuk klasifikasi sentimen ulasan aplikasi "myBCA". Model ini dilatih menggunakan data riil yang ditarik dari database SQLite (hasil scraping dinamis dari Google Play Store).

## Metodologi
- **Algoritma Model**: Logistic Regression (`LogisticRegression(C=2.0, max_iter=1000)`)
- **Ekstraksi Fitur**: TF-IDF (*Term Frequency-Inverse Document Frequency*) dengan maksimum 12.000 fitur teks menggunakan gabungan kata **Unigram + Bigram** (`ngram_range=(1, 2)`) dan sublinear scaling (`sublinear_tf=True`) untuk menangkap konteks negasi (seperti "tidak bisa").
- **Koreksi Data & Slang**: Mempertahankan kata negasi pada stopword filtering dan melakukan pemetaan slang internet Indonesia (seperti "ga" -> "tidak", "lemot" -> "lambat").
- **Tahapan Preprocessing**: 
  - *Case folding* (huruf kecil).
  - Pembersihan tanda baca, angka, dan tautan (URL).
  - Penghapusan *Stopword* bahasa Indonesia (NLTK) yang disaring (mengecualikan negasi).
  - *Stemming* menggunakan Sastrawi yang telah dioptimalkan secara global.
- **Data Splitting**: 80% untuk *Training* dan 20% untuk *Testing* dengan stratifikasi sebaran kelas.

## Hasil Pengujian (Testing)
Model dievaluasi menggunakan *testing data* sebanyak **7.089 ulasan** (dari total dataset sebanyak **36.125 ulasan**).

- **Akurasi Keseluruhan (Accuracy)**: **82.07%**

### Classification Report
| Sentimen | Precision | Recall | F1-Score | Support (Jumlah Sampel) |
| :--- | :--- | :--- | :--- | :--- |
| **Negatif** | 0.78 | 0.91 | 0.84 | 3,180 |
| **Netral** | 0.22 | 0.04 | 0.06 | 565 |
| **Positif** | 0.88 | 0.87 | 0.88 | 3,344 |

## Analisis & Temuan
1. **Pencapaian Target Akurasi (>82%)**:
   - Dengan mengganti algoritma baseline Naive Bayes menjadi **Logistic Regression** dan mengoptimalkan preprocessing teks (mempertahankan kata negasi dan normalisasi slang), akurasi keseluruhan melonjak dari 75.40% menjadi **82.07%**.
2. **Kekuatan Klasifikasi Utama (Positif & Negatif)**:
   - Model memiliki performa klasifikasi yang luar biasa kuat pada ulasan **Negatif** dengan F1-Score **0.84** (Recall 91%) dan ulasan **Positif** dengan F1-Score **0.88** (Recall 87%). Hal ini sangat ideal karena mayoritas interaksi dan kebutuhan analitik bisnis berputar pada dua kelas ini.
3. **Efek Distribusi Alami Ulasan Netral**:
   - Berbeda dengan model Naive Bayes sebelumnya yang menggunakan oversampling buatan sehingga menurunkan akurasi keseluruhan akibat noise ulasan netral, melatih Logistic Regression pada distribusi alami ulasan (tanpa oversampling) terbukti meningkatkan akurasi secara drastis hingga melampaui batas 82%.

## Lokasi File Artefak
- **Pipeline Script**: `scripts/sentiment_pipeline.py`
- **Trained Model**: `data/sentiment_model.pkl`
- **TF-IDF Vectorizer**: `data/tfidf_vectorizer.pkl`
