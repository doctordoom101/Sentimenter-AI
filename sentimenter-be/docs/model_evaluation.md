# Laporan Evaluasi Model Sentimen

## Deskripsi
Dokumen ini merangkum proses pelatihan dan hasil evaluasi model *Machine Learning* untuk klasifikasi sentimen ulasan aplikasi "myBCA". Model ini dilatih untuk mengklasifikasikan teks ulasan ke dalam tiga kategori sentimen: `positif`, `netral`, dan `negatif`.

## Metodologi
- **Algoritma Model**: Naive Bayes (`MultinomialNB`)
- **Ekstraksi Fitur**: TF-IDF (*Term Frequency-Inverse Document Frequency*) dengan maksimum 5000 fitur teks.
- **Tahapan Preprocessing**: 
  - *Case folding* (huruf kecil).
  - Pembersihan tanda baca, angka, dan tautan (URL).
  - Penghapusan *Stopword* bahasa Indonesia (NLTK).
  - *Stemming* menggunakan Sastrawi untuk menormalkan kata berimbuhan menjadi kata dasar.
- **Data Splitting**: 80% untuk *Training* dan 20% untuk *Testing* dengan stratifikasi agar sebaran data proporsional.

## Hasil Pengujian (Testing)
Model dievaluasi menggunakan *testing data* sebanyak **196 sampel**.

- **Akurasi Keseluruhan (Accuracy)**: **77.04%**

### Classification Report
| Sentimen | Precision | Recall | F1-Score | Support (Jumlah Sampel) |
| :--- | :--- | :--- | :--- | :--- |
| **Negatif** | 0.72 | 0.95 | 0.82 | 103 |
| **Netral** | 0.00 | 0.00 | 0.00 | 18 |
| **Positif** | 0.90 | 0.71 | 0.79 | 75 |

## Analisis & Temuan
1. **Performa Mayoritas Kelas**: Dengan akurasi mencapai ~77%, model sudah tergolong baik dalam membedakan dua sentimen dominan (Positif dan Negatif). Presisi model dalam mendeteksi sentimen **Positif** mencapai **90%**, dan tingkat temuan (*Recall*) untuk sentimen **Negatif** menyentuh angka **95%**.
2. **Ketidakseimbangan Data (Data Imbalance)**: 
   - Model sama sekali gagal mendeteksi kelas **Netral** (mendapat skor 0 pada presisi dan *recall*).
   - Masalah ini terjadi karena dataset sangat tidak seimbang; jumlah data berlabel Netral hanya 18 (sangat sedikit dibanding kelas lain). Naive Bayes memprioritaskan probabilitas tertinggi sehingga "mengorbankan" kelas minoritas tersebut.

## Rekomendasi Perbaikan (*Future Work*)
Untuk meningkatkan performa model di iterasi selanjutnya, beberapa langkah berikut disarankan:
- **Penambahan Data (Data Augmentation)**: Mengumpulkan dan melabeli lebih banyak ulasan netral agar representasi datanya cukup.
- **Handling Imbalance**: Menerapkan teknik *Oversampling* (seperti SMOTE) atau menggunakan fungsi bobot (class_weight) pada algoritma yang mendukung.
- **Eksplorasi Algoritma**: Menguji menggunakan model yang lebih kuat menangani ketidakseimbangan, seperti Random Forest, SVM, atau bahkan model *Deep Learning* berbasis Transformer (misalnya IndoBERT).

## Lokasi File Artefak
- **Pipeline Script**: `scripts/sentiment_pipeline.py`
- **Trained Model**: `data/sentiment_model.pkl`
- **TF-IDF Vectorizer**: `data/tfidf_vectorizer.pkl`
