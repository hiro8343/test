import json
import csv
import os

# Define paths
json_file_path = 'data/cool_items.json'
csv_file_path = 'data/export_cool_items.csv'

def json_to_csv():
    # Check if JSON file exists
    if not os.path.exists(json_file_path):
        print(f"Error: {json_file_path} not found.")
        return

    try:
        # Read JSON data
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not data:
            print("No data found in JSON file.")
            return

        # Prepare headers (keys from the first item)
        headers = list(data[0].keys())

        # Write to CSV
        with open(csv_file_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(data)

        print(f"Successfully exported data to {csv_file_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    json_to_csv()
