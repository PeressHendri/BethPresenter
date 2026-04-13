import os

src_dir = os.path.join(os.path.dirname(__file__), '../frontend/src')

color_map = {
    '[#80000030]': 'primary-border',
    '[#80000020]': 'primary/20',
    '[#80000010]': 'primary/10',
    '[#80000005]': 'primary/5',
    '[#80000008]': 'primary/10',
    '[#80000040]': 'primary/40',
    '[#800000]': 'primary',         
    '[#5C0000]': 'primary-dark',
    '[#A00000]': 'primary-light',
    '[#FDF2F2]': 'primary-pale',

    '[#F8F9FA]': 'gray-50',
    '[#F1F1F3]': 'gray-100',
    '[#E2E2E6]': 'gray-200',
    '[#C6C6C8]': 'gray-300',
    '[#AEAEB2]': 'gray-400',
    '[#8E8E93]': 'gray-500',
    '[#6C6C70]': 'gray-600',
    '[#4A4A4E]': 'gray-700',
    '[#2D2D2E]': 'gray-800',
    '[#1A1A1A]': 'gray-900',

    '[#10B981]': 'success',
    '[#EF4444]': 'error',
    '[#F59E0B]': 'warning',
    '[#3B82F6]': 'info',
    '[#8B5CF6]': 'rehearsal',
}

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.tsx', '.js')):
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                
                for hex_val, semantic in color_map.items():
                    prefixes = [
                        'bg-', 'text-', 'border-', 'ring-', 'fill-', 'shadow-',
                        'hover:bg-', 'hover:text-', 'hover:border-',
                        'group-hover:text-', 'group-hover:bg-',
                        'border-b-', 'border-t-', 'border-l-', 'border-r-', 'focus:ring-', 'focus:border-'
                    ]

                    for p in prefixes:
                        content = content.replace(p + hex_val, p + semantic)
                
                if content != original:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated colors in {full_path}")

process_directory(src_dir)
print("Done replacing hardcoded hex codes with tailwind semantic classes.")
