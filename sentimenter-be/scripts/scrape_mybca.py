import os
from app.services.scraper import scrape_reviews_batch, save_to_csv

def main():
    app_id = 'com.bca.mybca.omni.android'
    output_file = 'mybca_reviews.csv'
    # Ubah 'count' untuk mengambil lebih banyak data. 
    # Gunakan scrape_all_reviews(app_id) jika ingin mengambil SEMUA review (bisa memakan waktu lama).
    count = 1000  
    
    print(f"Memulai scraping untuk {app_id}...")
    
    # Scrape data
    reviews_data = scrape_reviews_batch(app_id, count=count)
    
    if reviews_data:
        # Simpan ke CSV
        success = save_to_csv(reviews_data, output_file)
        if success:
            print(f"Scraping selesai! Data disimpan di {output_file}")
        else:
            print("Gagal menyimpan data ke CSV.")
    else:
        print("Tidak ada data yang berhasil diambil.")

if __name__ == "__main__":
    # Pastikan PYTHONPATH diatur agar bisa mengimport dari folder app
    # Atau jalankan dengan: python scrape_mybca.py
    main()
