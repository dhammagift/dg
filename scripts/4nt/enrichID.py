import re
from pathlib import Path

def enrich_html_with_ids(directory):
    pattern = re.compile(r'(<a\s+class="ix-row"\s+href="([^/]+)/index\.html")')
    
    for filepath in Path(directory).rglob('*.html'):
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            new_content = pattern.sub(r'\1 id="\2"', content)
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
        except Exception as e:
            print(f"Ошибка при обработке {filepath}: {e}")

if __name__ == "__main__":
    enrich_html_with_ids(".")


