import urllib.request
import sys

url = 'https://docs.google.com/spreadsheets/d/1IN-PC0r_y6WHSQs1-Xklakj72LYm43q6xUspQ0KueXE/export?format=csv'
output_file = 'temp_cool_new.csv'

try:
    print(f"Downloading from {url}...")
    with urllib.request.urlopen(url) as response:
        content = response.read()
        with open(output_file, 'wb') as f:
            f.write(content)
        print(f"Successfully saved to {output_file}")
        
        # Sort of a preview
        try:
            print("Preview of independent first 3 lines:")
            text_content = content.decode('utf-8')
            print('\n'.join(text_content.splitlines()[:3]))
        except:
            print("Could not decode preview (might be binary or shift_jis)")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
