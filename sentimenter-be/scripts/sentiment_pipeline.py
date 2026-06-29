import pandas as pd
import numpy as np
import re
import string
import joblib
import nltk
from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score

# Download NLTK stopwords if not available
nltk.download('stopwords', quiet=True)

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
    
    # 5. Stopword removal (Indonesian)
    stop_words = set(stopwords.words('indonesian'))
    words = text.split()
    words = [word for word in words if word not in stop_words]
    
    # 6. Stemming (Sastrawi)
    # Note: Sastrawi can be slow for large datasets.
    factory = StemmerFactory()
    stemmer = factory.create_stemmer()
    stemmed_words = [stemmer.stem(word) for word in words]
    
    return " ".join(stemmed_words)

def main():
    print("Mulai proses Pipeline Sentimen...")
    
    # 1. Load Data
    data_path = 'data/mybca_reviews.csv'
    print(f"Membaca data dari {data_path}...")
    try:
        df = pd.read_csv(data_path)
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
    
    # Take a sample if dataset is too large to speed up Sastrawi stemming during dev
    # (Optional) df = df.sample(1000) 

    # 3. Text Preprocessing
    print("Memulai preprocessing teks (ini mungkin memakan waktu)...")
    # Drop missing reviews
    df = df.dropna(subset=['content'])
    df['cleaned_content'] = df['content'].apply(preprocess_text)
    
    # Hapus row yang cleaned_content-nya kosong setelah prepocessing
    df = df[df['cleaned_content'] != ""]

    # 4. Split Data
    print("Membagi data training dan testing...")
    X = df['cleaned_content']
    y = df['sentiment']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 5. TF-IDF Vectorization
    print("Mengekstraksi fitur dengan TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # 6. Modeling
    print("Melatih model Naive Bayes...")
    model = MultinomialNB()
    model.fit(X_train_vec, y_train)
    
    # 7. Evaluation
    print("Mengevaluasi model...")
    y_pred = model.predict(X_test_vec)
    print("\nAccuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # 8. Save Model and Vectorizer
    model_path = 'data/sentiment_model.pkl'
    vectorizer_path = 'data/tfidf_vectorizer.pkl'
    print("Menyimpan model ke direktori data...")
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print("Selesai! Pipeline berhasil dijalankan.")

if __name__ == "__main__":
    main()
