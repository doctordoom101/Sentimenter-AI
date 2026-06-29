import joblib
import re
import string
import os
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
import nltk
from nltk.corpus import stopwords

# Ensure stopwords are downloaded
nltk.download('stopwords', quiet=True)

class MLService:
    def __init__(self):
        # Determine the base directory (sentimenter-be)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, 'data', 'sentiment_model.pkl')
        vectorizer_path = os.path.join(base_dir, 'data', 'tfidf_vectorizer.pkl')
        
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        
        factory = StemmerFactory()
        self.stemmer = factory.create_stemmer()
        self.stop_words = set(stopwords.words('indonesian'))

    def preprocess_text(self, text: str) -> str:
        if not isinstance(text, str):
            return ""
        
        text = text.lower()
        text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)
        text = re.sub(r"\d+", "", text)
        text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
        text = text.strip()
        text = re.sub(r'\s+', ' ', text)
        
        words = text.split()
        words = [word for word in words if word not in self.stop_words]
        
        # Stemming
        stemmed_words = [self.stemmer.stem(word) for word in words]
        return " ".join(stemmed_words)

    def predict(self, text: str):
        cleaned_text = self.preprocess_text(text)
        if not cleaned_text:
            return "netral", 0.0 # fallback
        
        vec = self.vectorizer.transform([cleaned_text])
        prediction = self.model.predict(vec)[0]
        
        # calculate confidence
        probs = self.model.predict_proba(vec)[0]
        confidence = max(probs)
        
        return prediction, float(confidence)

ml_service = MLService()
