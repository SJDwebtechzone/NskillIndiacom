import os

courses_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\courses\page.tsx'
with open(courses_path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = '                             <Link href={/courses/} className="flex-1 bg-white border border-[#0b1f3a] hover:bg-[#0b1f3a] hover:text-white text-[#0b1f3a] text-center text-[10px] uppercase tracking-wide font-black py-2 rounded-lg transition-colors">\n'
content = content.replace(bad_str, '')

with open(courses_path, 'w', encoding='utf-8') as f:
    f.write(content)
