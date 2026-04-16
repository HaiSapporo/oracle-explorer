import os
import glob
import json
import re

def clean_text(html_text):
    text = re.sub(r'<[^>]+>', '', html_text)
    text = text.replace('&#32;', ' ')
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&amp;', '&')
    return text.strip()

def parse_html(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    filename = os.path.basename(filepath)
    table_name_from_file = filename.replace('.html', '')
    
    # Try to extract the display name (Logical Name)
    table_logical_name = ''
    logical_match = re.search(r'<th>(?:System Name|システム名|論理名|Logical Name)</th>\s*<td>(.*?)</td>', content, re.IGNORECASE)
    if logical_match:
        table_logical_name = clean_text(logical_match.group(1))

    # Identify if there is a caption for Table Info that provides better table names
    table_caption_match = re.search(r'<div class="tableinfo-caption"[^>]*>.*?<td>(.*?)</td>', content, re.DOTALL | re.IGNORECASE)
    display_title = table_name_from_file
    if table_caption_match:
        title = clean_text(table_caption_match.group(1))
        if title:
            # Often it's like "public . User"
            title = title.replace(' . ', '.')
            display_title = title
    
    # Extract columns
    col_table_match = re.search(r'<caption>(?:Column info|カラム情報|.*カラム.*|.*Column.*?)</caption>(.*?)</table>', content, re.DOTALL | re.IGNORECASE)
    
    columns = []
    if col_table_match:
        col_table_html = col_table_match.group(1)
        trs = re.findall(r'<tr[^>]*>(.*?)</tr>', col_table_html, re.DOTALL | re.IGNORECASE)
        
        for tr in trs:
            if '<th' in tr.lower():
                continue
                
            tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.DOTALL | re.IGNORECASE)
            
            cleaned_tds = [clean_text(td) for td in tds]
                
            if len(cleaned_tds) >= 7:
                columns.append({
                    'no': cleaned_tds[0],
                    'logicalName': cleaned_tds[1],
                    'physicalName': cleaned_tds[2],
                    'dataType': cleaned_tds[3],
                    'notNull': cleaned_tds[4],
                    'default': cleaned_tds[5],
                    'remark': cleaned_tds[6]
                })

    return {
        'tableName': display_title,
        'logicalName': table_logical_name,
        'columns': columns
    }

def build():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    tables_dir = os.path.join(script_dir, 'tables')
    
    if not os.path.exists(tables_dir):
        print(f"Error: Directory not found: {tables_dir}")
        return
        
    html_files = glob.glob(os.path.join(tables_dir, '*.html'))
    
    db_schema = []
    for f in html_files:
        try:
            table_info = parse_html(f)
            db_schema.append(table_info)
        except Exception as e:
            print(f"Error parsing {f}: {e}")
            
    db_schema.sort(key=lambda x: x['tableName'].lower())
            
    out_path = os.path.join(script_dir, 'data.js')
    with open(out_path, 'w', encoding='utf-8') as f:
        json_dump = json.dumps(db_schema, ensure_ascii=False, indent=2)
        f.write(f"const DB_SCHEMA = {json_dump};\n")
        
    print(f"Success! Extracted {len(db_schema)} tables to data.js")

if __name__ == '__main__':
    build()
