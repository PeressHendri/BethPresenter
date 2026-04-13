import os
import re

src_dir = os.path.join(os.getcwd(), 'frontend/src')

replacements = {
    # Border radius reductions globally
    r'rounded-\[40px\]': 'rounded-2xl',
    r'rounded-\[32px\]': 'rounded-xl',
    r'rounded-\[24px\]': 'rounded-lg',
    r'rounded-3xl': 'rounded-xl',
    
    # Specific colors to maroon
    r'text-\[\#0021B9\]': 'text-[#800000]',
    r'text-\[\#D04423\]': 'text-[#800000]',
    r'text-\[\#FF5B00\]': 'text-[#800000]',
    r'text-\[\#00A2FF\]': 'text-[#800000]',
    
    r'text-emerald-500': 'text-[#800000]',
    r'bg-\[\#10B981\]': 'bg-[#800000]',
    r'shadow-\[\#10B98120\]': 'shadow-[#80000020]',
    r'hover:bg-\[\#0CA678\]': 'hover:bg-[#5C0000]',
    
    # Ensure background rehearsal uses Maroon
    r'bg-\[\#583D72\]': 'bg-[#800000]',
    r'text-purple-300': 'text-[#800000]',
    r'text-\[\#8B5CF6\]': 'text-[#800000]',
    
    # Catch any standard success/info colors mapping to maroon since user wants strict maroon
    r'bg-emerald-100': 'bg-[#80000008]',
    r'bg-emerald-500': 'bg-[#800000]',
    r'hover:bg-emerald-600': 'hover:bg-[#5C0000]',
    r'text-blue-500': 'text-[#800000]',
    r'bg-blue-500': 'bg-[#800000]',
    r'bg-blue-600': 'bg-[#5C0000]'
}

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.jsx', '.js', '.tsx')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            original = content
            for p, r_val in replacements.items():
                content = re.sub(p, r_val, content)
            if content != original:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f'Updated leftovers {f}')
