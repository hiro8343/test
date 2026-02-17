import urllib.request
import sys

url = 'https://docs.google.com/spreadsheets/d/1PrI-tnJZOH2kRjnUQzWyn-9kVuASvL9hHbeQrs60ffQ/export?format=csv'
try:
    with urllib.request.urlopen(url) as response:
        content = response.read().decode('utf-8')
        print(content)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
