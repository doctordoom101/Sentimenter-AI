# Laporan Evaluasi Model Sentimen

## Deskripsi
Dokumen ini merangkum hasil pelatihan ulang (*retraining*) dan evaluasi model *Machine Learning* untuk klasifikasi sentimen ulasan aplikasi "myBCA". Model ini dilatih menggunakan data riil yang ditarik dari database SQLite (hasil scraping dinamis dari Google Play Store).

## Metodologi
- **Algoritma Model**: Naive Bayes (`MultinomialNB` dengan tuning `alpha=0.1`)
- **Ekstraksi Fitur**: TF-IDF (*Term Frequency-Inverse Document Frequency*) dengan maksimum 10.000 fitur teks menggunakan gabungan kata **Unigram + Bigram** (`ngram_range=(1, 2)`) untuk menangkap konteks negasi (seperti "tidak bisa").
- **Penyeimbangan Kelas**: Menerapkan teknik **Random Oversampling** di tingkat *training data* untuk mengatasi *data imbalance* (ketidakseimbangan jumlah ulasan positif, negatif, dan netral).
- **Tahapan Preprocessing**: 
  - *Case folding* (huruf kecil).
  - Pembersihan tanda baca, angka, dan tautan (URL).
  - Penghapusan *Stopword* bahasa Indonesia (NLTK).
  - *Stemming* menggunakan Sastrawi yang telah dioptimalkan secara global (10-50x lebih cepat).
- **Data Splitting**: 80% untuk *Training* dan 20% untuk *Testing* dengan stratifikasi sebaran kelas.

## Hasil Pengujian (Testing)
Model dievaluasi menggunakan *testing data* sebanyak **7.088 ulasan** (dari total dataset sebanyak **36.125 ulasan**).

- **Akurasi Keseluruhan (Accuracy)**: **75.40%**

### Classification Report
| Sentimen | Precision | Recall | F1-Score | Support (Jumlah Sampel) |
| :--- | :--- | :--- | :--- | :--- |
| **Negatif** | 0.77 | 0.80 | 0.79 | 3,180 |
| **Netral** | 0.21 | 0.34 | 0.26 | 564 |
| **Positif** | 0.91 | 0.78 | 0.84 | 3,344 |

## Analisis & Temuan
1. **Peningkatan Performa Kelas Minoritas (Netral)**:
   - Pada model sebelumnya, skor F1 untuk kelas **Netral** adalah **0.00** karena ketidakseimbangan data yang ekstrem (model mengabaikan kelas minoritas).
   - Dengan penerapan *Random Oversampling* pada data latih, kelas **Netral** sekarang berhasil dikenali dengan F1-Score **0.26** (Precision 21%, Recall 34%). Ini merupakan perbaikan krusialis.
2. **Kekuatan Deteksi Sentimen Utama**:
   - Model memiliki performa yang sangat kokoh dalam membedakan kelas **Negatif** (F1-Score **0.79**) dan kelas **Positif** (F1-Score **0.84**).
   - Presisi untuk kelas **Positif** menyentuh **91%**, yang berarti ulasan positif diklasifikasikan dengan keakuratan sangat tinggi.

## Lokasi File Artefak
- **Pipeline Script**: `scripts/sentiment_pipeline.py`
- **Trained Model**: `data/sentiment_model.pkl`
- **TF-IDF Vectorizer**: `data/tfidf_vectorizer.pkl`
