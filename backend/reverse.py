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

# Reverse the map
reverse_map = {v: k for k, v in color_map.items()}
# Force 'primary/10' back to something, 'primary/10' mapped from 80000010 and 80000008. We will use 80000010
reverse_map['primary/10'] = '[#80000010]'
reverse_map['primary/60'] = '[#80000060]'
reverse_map['primary/80'] = '[#80000080]'

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.tsx', '.js')):
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                
                # To prevent conflicts, we sort by length of semantic class descending
                # so that 'primary-border' is matched before 'primary'
                sorted_semantics = sorted(reverse_map.keys(), key=len, reverse=True)
                
                for semantic in sorted_semantics:
                    hex_val = reverse_map[semantic]
                    prefixes = [
                        'bg-', 'text-', 'border-', 'ring-', 'fill-', 'shadow-',
                        'hover:bg-', 'hover:text-', 'hover:border-',
                        'group-hover:text-', 'group-hover:bg-',
                        'border-b-', 'border-t-', 'border-l-', 'border-r-', 'focus:ring-', 'focus:border-',
                        'accent-'
                    ]

                    for p in prefixes:
                        content = content.replace(p + semantic, p + hex_val)
                
                if content != original:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Reverted colors in {full_path}")

process_directory(src_dir)
print("Done reverting to hardcoded hex codes.")
