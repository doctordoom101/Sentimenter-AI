from google_play_scraper import reviews_all, reviews, Sort
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_all_reviews(app_id: str, lang: str = 'id', country: str = 'id'):
    """
    Scrapes all reviews for a given app ID. Use with caution for apps with many reviews.
    """
    try:
        logger.info(f"Scraping all reviews for {app_id}...")
        result = reviews_all(
            app_id,
            sleep_milliseconds=0,
            lang=lang,
            country=country,
            sort=Sort.NEWEST,
        )
        logger.info(f"Successfully scraped {len(result)} reviews.")
        return result
    except Exception as e:
        logger.error(f"Error scraping all reviews: {e}")
        return []

def scrape_reviews_batch(app_id: str, count: int = 1000, lang: str = 'id', country: str = 'id'):
    """
    Scrapes a specific number of reviews for a given app ID.
    """
    try:
        logger.info(f"Scraping {count} reviews for {app_id}...")
        result, continuation_token = reviews(
            app_id,
            lang=lang,
            country=country,
            sort=Sort.NEWEST,
            count=count
        )
        logger.info(f"Successfully scraped {len(result)} reviews.")
        return result
    except Exception as e:
        logger.error(f"Error scraping reviews batch: {e}")
        return []

def save_to_csv(data, filename: str):
    """
    Saves the list of review dictionaries to a CSV file.
    """
    if not data:
        logger.warning("No data to save.")
        return False
    
    try:
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False, encoding='utf-8')
        logger.info(f"Data saved to {filename}")
        return True
    except Exception as e:
        logger.error(f"Error saving to CSV: {e}")
        return False

def analyze_sentiment_placeholder(text: str):
    """
    Placeholder for sentiment analysis logic.
    """
    # Logic for ML model goes here
    return "Neutral"
