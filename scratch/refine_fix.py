import os
import re

def fix_content(content):
    # Fix control characters that were likely meant to be \c but became control chars
    replacements = {
        '\x0c': 'f', # \f -> Form Feed
        '\x09': 't', # \t -> Tab (Note: this might affect actual indentation)
        '\x08': 'b', # \b -> Backspace
        '\x0b': 'v', # \v -> Vertical Tab
        '\x07': 'a', # \a -> Bell
    }
    
    for char, replacement in replacements.items():
        content = content.replace(char, replacement)
    
    # Special case for 'order-2' which we now know was 'border-2'
    # but the 'b' might have been deleted if it was processed as a backspace
    # Actually, if \b was already processed and deleted 'b', we might have 'order-2'.
    # But wait, 'border-2' has 'b' followed by 'o'.
    # If \b deleted the \, we get 'border-2'.
    # If \b deleted the b, we get 'order-2'.
    content = content.replace(' order-2 border-dashed', ' border-2 border-dashed')
    content = content.replace('"order-2 border-dashed', '"border-2 border-dashed')

    # Fix className={ ... } missing quotes
    def wrap_classname(match):
        inner = match.group(1).strip()
        if inner.startswith(('"', "'", '`')) or '${' in inner:
            return match.group(0)
        return f'className="{inner}"'

    content = re.sub(r'className=\{([^}]+)\}', wrap_classname, content)
    
    # Fix style={{ width: ${progress}% }}
    content = re.sub(r'style=\{\{\s*width:\s*\$\{([^}]+)\}\s*%\s*\}\}', r'style={{ width: `${\1}%` }}', content)
    
    # Fix "n"n -> \n\n
    content = content.replace('"n"n', '\\n\\n')
    
    return content

def main():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if not file.endswith(('.ts', '.tsx', '.json', '.html', '.css', '.js', '.md')):
                continue
                
            filepath = os.path.join(root, file)
            try:
                # Read as bytes first to handle potential encoding issues or just read as utf-8
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                new_content = fix_content(content)
                
                if new_content != content:
                    print(f"Refining {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    main()
