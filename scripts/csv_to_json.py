import csv
import json
import os
import sys
import traceback

# Setup paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR) # parent of scripts/
CSV_PATH = os.path.join(PROJECT_ROOT, 'temp_cool_new.csv')
JSON_PATH = os.path.join(PROJECT_ROOT, 'data', 'cool_items.json')

def get_category_id(jp_category):
    mapping = {
        '宇宙': 'space',
        '理科': 'space',
        '生物': 'space',
        '地学': 'space',
        '数学': 'math',
        '算数': 'math',
        '言語': 'math',
        '地理': 'world',
        '公民': 'world',
        '世界': 'world',
        '歴史': 'history',
        '歴史（日本史）': 'history',
        '歴史（世界史）': 'history',
        '文学': 'literature',
        'アニメ・漫画': 'manga_anime',
        'マンガ': 'manga_anime',
        '漫画': 'manga_anime',
        'アニメ': 'manga_anime',
        '教養': 'culture',
        '雑学': 'culture',
        '文化': 'culture',
        '物理': 'science',
        '化学': 'science'
    }
    return mapping.get(jp_category, 'culture')

def csv_to_json():
    print(f"Reading CSV from: {CSV_PATH}")
    print(f"Writing JSON to: {JSON_PATH}")

    items = []
    
    try:
        # Try utf-8-sig to handle BOM if present, otherwise utf-8
        with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for i, row in enumerate(reader):
                if not row.get('タイトル') or not row.get('内容'):
                    continue

                category_jp = row.get('カテゴリー', '').strip()
                
                # Check active flag (using 'ファクトチェック' column as sample, assuming always active if present?)
                # In fetch_csv.py output: column 6 is 'ファクトチェック', value is '◯'
                # Let's assume valid rows have data.
                
                item = {
                    "id": i + 1,
                    "category": get_category_id(category_jp),
                    "title": row.get('タイトル', '').strip(),
                    "description": row.get('解説', '').strip(),
                    "content": row.get('内容', '').strip(),
                    "stars": 3,
                    "explanationUrl": row.get('チェック用URL', '').strip(),
                    "wordUrl": row.get('チェック用URL', '').strip()
                }
                
                # Dynamic stars
                length = len(item['content'])
                if length > 200: item['stars'] = 5
                elif length > 100: item['stars'] = 4
                elif length > 40: item['stars'] = 3
                else: item['stars'] = 2

                items.append(item)

        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=4, ensure_ascii=False)
        
        print(f"Successfully converted {len(items)} items.")

    except Exception:
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    csv_to_json()
