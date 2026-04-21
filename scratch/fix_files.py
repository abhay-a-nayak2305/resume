import os

def fix_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
        
        if content.startswith(b'\xff\xfe'):
            print(f"Fixing {filepath} (UTF-16LE)")
            # Decode as UTF-16LE
            text = content.decode('utf-16le')
            
            # The corruption seems to be:
            # 1. Double quotes replaced by backslashes
            # 2. Backslashes sometimes followed by newlines
            
            # Let's try a simple heuristic: if a backslash is followed by something that 
            # looks like it should be quoted, or it's at the end of a value.
            
            # Looking at the hex: 3D 00 5C 00 0D 00 0A 00 65 00
            # That's lang=\\r\\n en
            # It should be lang="en"
            
            # It seems " was replaced by \ and then maybe some formatting happened.
            # But wait, if I just replace all \ with " in these files, would that work?
            # Probably not if there are actual backslashes.
            
            # Let's look at the patterns:
            # =\r\n -> ="
            # \> -> ">
            # \  -> " 
            # \: -> ":
            # \{ -> "{
            
            # Actually, if I look at backend/package.json:
            # \name\
            # It should be "name"
            
            # So basically \ is used instead of "
            
            fixed_text = text.replace('\\\r\n', '"').replace('\\', '"')
            
            # Also, sometimes it might be just \ without \r\n
            # fixed_text = fixed_text.replace('\\', '"')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_text)
            print(f"Fixed {filepath} and converted to UTF-8")
            return True
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")
    return False

def main():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            filepath = os.path.join(root, file)
            if file.endswith(('.ts', '.tsx', '.json', '.html', '.css', '.js')):
                fix_file(filepath)

if __name__ == "__main__":
    main()
