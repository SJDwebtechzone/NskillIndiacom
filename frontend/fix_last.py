import os

courses_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\courses\page.tsx'
with open(courses_path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = '                          <div className={ bsolute bottom-0 left-3 px-3 py-1 rounded-t-lg text-[10px] uppercase font-black text-white shadow-sm }>\n'
content = content.replace(bad_str, '')

with open(courses_path, 'w', encoding='utf-8') as f:
    f.write(content)
