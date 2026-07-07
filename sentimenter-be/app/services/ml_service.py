import joblib
import re
import string
import os
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
import nltk
from nltk.corpus import stopwords

# Ensure stopwords are downloaded
nltk.download('stopwords', quiet=True)

# Negation words to KEEP in sentiment context
negation_words = {'tidak', 'kurang', 'bukan', 'belum', 'jangan', 'tidaklah', 'tanpa', 'ga', 'gak', 'gk', 'gbs'}

slang_dict = {
    "ga": "tidak", "gak": "tidak", "gk": "tidak", "dgn": "dengan", "yg": "yang", 
    "bgt": "banget", "lemot": "lambat", "gbs": "tidak bisa", "error": "salah", 
    "klo": "kalau", "kl": "kalau", "tp": "tetapi", "tpi": "tetapi", "sdh": "sudah",
    "dah": "sudah", "bca": "bank", "app": "aplikasi", "apk": "aplikasi",
    "krn": "karena", "karna": "karena", "nyesel": "menyesal", "kecewa": "kecewa",
    "jelek": "buruk", "ok": "oke", "sip": "oke", "mantap": "bagus", "top": "bagus"
}

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
        self.stop_words = set(stopwords.words('indonesian')) - negation_words

    def preprocess_text(self, text: str, use_stemming: bool = True) -> str:
        if not isinstance(text, str):
            return ""
        
        text = text.lower()
        text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)
        text = re.sub(r"\d+", "", text)
        text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
        text = text.strip()
        text = re.sub(r'\s+', ' ', text)
        
        words = text.split()
        normalized_words = [slang_dict.get(word, word) for word in words]
        filtered_words = [word for word in normalized_words if word not in self.stop_words]
        
        if not use_stemming:
            return " ".join(filtered_words)
            
        # Stemming
        stemmed_words = [self.stemmer.stem(word) for word in filtered_words]
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

    def extract_keywords(self, text: str, top_n: int = 3) -> list[str]:
        cleaned_text = self.preprocess_text(text)
        if not cleaned_text:
            return ["ulasan"]
            
        # Transform the single text
        vec = self.vectorizer.transform([cleaned_text])
        
        # Get feature names (words)
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Get vector values
        cx = vec.tocoo()
        
        # Create a list of (word, score) tuples
        word_scores = []
        for col, val in zip(cx.col, cx.data):
            word_scores.append((feature_names[col], val))
            
        # Sort by score descending
        word_scores = sorted(word_scores, key=lambda x: x[1], reverse=True)
        
        # Get top N stemmed keywords
        stemmed_keywords = [word for word, score in word_scores[:top_n]]
        
        # Fallback if no keywords extracted
        if not stemmed_keywords:
            stemmed_keywords = cleaned_text.split()[:top_n]
            
        if not stemmed_keywords:
            return ["ulasan"]
            
        # Map stemmed keywords back to original words in the text
        original_words = re.sub(f"[{re.escape(string.punctuation)}]", " ", text).split()
        
        mapped_keywords = []
        for stem_kw in stemmed_keywords:
            found = False
            for orig in original_words:
                if self.stemmer.stem(orig.lower()) == stem_kw:
                    mapped_keywords.append(orig.lower())
                    found = True
                    break
            if not found:
                mapped_keywords.append(stem_kw)
                
        # Remove duplicates while maintaining order
        seen = set()
        final_keywords = []
        for kw in mapped_keywords:
            if kw not in seen and len(kw) > 2: # ignore very short words
                final_keywords.append(kw)
                seen.add(kw)
                
        if not final_keywords:
            return ["ulasan"]
            
        return final_keywords[:top_n]

ml_service = MLService()
