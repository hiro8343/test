import sys
print("Hello from Python")
try:
    with open('temp_cool.csv', 'r', encoding='utf-8') as f:
        print("Read file success")
except Exception as e:
    print(f"Error reading file: {e}")
