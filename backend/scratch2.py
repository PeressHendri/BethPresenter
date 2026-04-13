import os
import re

src_dir = os.path.join(os.getcwd(), 'frontend/src')

replacements = {
    r'hover:bg-black': 'hover:bg-[#5C0000]',
    r'bg-\[\#B45F52\]': 'bg-[#800000]',
    r'hover:bg-\[\#D46F62\]': 'hover:bg-[#5C0000]',
    r'hover:text-red-500': 'hover:text-[#800000]',
    r'text-red-500': 'text-[#800000]',
    r'group-hover:border-\[\#10B981\]': 'group-hover:border-[#800000]',
    r'shadow-\[\#10B98120\]': 'shadow-[#80000020]',
    r'text-blue-500': 'text-[#800000]',
    r'hover:text-blue-500': 'hover:text-[#800000]',
    r'bg-emerald-50': 'bg-white',
    r'text-emerald-600': 'text-[#800000]',
    r'border-emerald-200': 'border-[#80000030]'
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
                print(f'Polished buttons in {f}')
