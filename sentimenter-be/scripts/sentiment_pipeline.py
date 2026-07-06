import pandas as pd
import numpy as np
import re
import string
import joblib
import nltk
import os
import sqlite3
from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

# Download NLTK stopwords if not available
nltk.download('stopwords', quiet=True)

# Negation words to KEEP in sentiment context
negation_words = {'tidak', 'kurang', 'bukan', 'belum', 'jangan', 'tidaklah', 'tanpa', 'ga', 'gak', 'gk', 'gbs'}
stop_words = set(stopwords.words('indonesian')) - negation_words

print("Menginisialisasi Sastrawi Stemmer...")
factory = StemmerFactory()
stemmer = factory.create_stemmer()

# Indonesian internet slang dictionary
slang_dict = {
    "ga": "tidak", "gak": "tidak", "gk": "tidak", "dgn": "dengan", "yg": "yang", 
    "bgt": "banget", "lemot": "lambat", "gbs": "tidak bisa", "error": "salah", 
    "klo": "kalau", "kl": "kalau", "tp": "tetapi", "tpi": "tetapi", "sdh": "sudah",
    "dah": "sudah", "bca": "bank", "app": "aplikasi", "apk": "aplikasi",
    "krn": "karena", "karna": "karena", "nyesel": "menyesal", "kecewa": "kecewa",
    "jelek": "buruk", "ok": "oke", "sip": "oke", "mantap": "bagus", "top": "bagus"
}

def label_sentiment(score):
    if score <= 2:
        return 'negatif'
    elif score == 3:
        return 'netral'
    else:
        return 'positif'

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Remove punctuation and numbers
    text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)
    text = re.sub(r"\d+", "", text)
    
    # 3. Remove URLs
    text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
    
    # 4. Remove extra whitespaces
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    
    words = text.split()
    # 5. Normalize slang
    normalized_words = [slang_dict.get(word, word) for word in words]
    # 6. Stopword removal (keeping negations)
    filtered_words = [word for word in normalized_words if word not in stop_words]
    # 7. Stemming (Sastrawi) using global stemmer
    stemmed_words = [stemmer.stem(word) for word in filtered_words]
    
    return " ".join(stemmed_words)

def main():
    print("Mulai proses Pipeline Sentimen Baru (Logistic Regression - Optimasi Distribusi)...")
    
    # Base directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'data', 'sentimenter.db')
    csv_path = os.path.join(base_dir, 'data', 'mybca_reviews.csv')
    
    df = None
    
    # 1. Load Data
    if os.path.exists(db_path):
        print(f"Membaca data dari database SQLite: {db_path}...")
        try:
            conn = sqlite3.connect(db_path)
            df = pd.read_sql_query("SELECT content, score FROM reviews", conn)
            conn.close()
            print(f"Berhasil membaca {len(df)} ulasan dari database.")
        except Exception as e:
            print(f"Gagal membaca dari database: {e}. Mencoba membaca dari CSV...")
            
    if df is None or len(df) == 0:
        print(f"Membaca data dari CSV: {csv_path}...")
        try:
            df = pd.read_csv(csv_path)
            print(f"Berhasil membaca {len(df)} ulasan dari CSV.")
        except FileNotFoundError:
            print("Data tidak ditemukan! Pastikan file berada di path yang benar.")
            return

    # Check if 'score' and 'content' exists
    if 'score' not in df.columns or 'content' not in df.columns:
        print("Kolom 'score' atau 'content' tidak ditemukan dalam data.")
        return

    # 2. Labeling
    print("Melakukan pelabelan sentimen berdasarkan rating...")
    df['sentiment'] = df['score'].apply(label_sentiment)
    
    # 3. Text Preprocessing
    print("Memulai preprocessing teks (menggunakan Sastrawi yang dioptimalkan + slang normalization)...")
    df = df.dropna(subset=['content'])
    df['cleaned_content'] = df['content'].apply(preprocess_text)
    
    # Hapus row yang cleaned_content-nya kosong setelah preprocessing
    df = df[df['cleaned_content'] != ""]

    # 4. Split Data
    print("Membagi data training dan testing...")
    X = df['cleaned_content']
    y = df['sentiment']
    
    # Stratified split to ensure proportion is kept
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Sebaran kelas data training:")
    print(y_train.value_counts())

    # 5. TF-IDF Vectorization
    print("Mengekstraksi fitur dengan TF-IDF (Unigram + Bigram + Sublinear TF)...")
    # sublinear_tf=True membantu mengurangi bias ulasan yang sangat panjang
    vectorizer = TfidfVectorizer(max_features=12000, ngram_range=(1, 2), min_df=2, sublinear_tf=True)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # 6. Modeling
    print("Melatih model Logistic Regression...")
    model = LogisticRegression(C=2.0, max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)
    
    # 7. Evaluation
    print("Mengevaluasi model...")
    y_pred = model.predict(X_test_vec)
    print("\nAccuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # 8. Save Model and Vectorizer
    model_path = os.path.join(base_dir, 'data', 'sentiment_model.pkl')
    vectorizer_path = os.path.join(base_dir, 'data', 'tfidf_vectorizer.pkl')
    print("Menyimpan model ke direktori data...")
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print(f"Model disimpan di: {model_path}")
    print(f"Vectorizer disimpan di: {vectorizer_path}")
    print("Selesai! Pipeline berhasil dijalankan.")

if __name__ == "__main__":
    main()
