import sys

file_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\course_calender\page.tsx'
hero_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\course_calender\hero.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

with open(hero_path, 'r', encoding='utf-8') as f:
    hero_content = f.read()

start_idx = content.find('      {/* ── Page Banner ── */}')
if start_idx == -1:
    start_idx = content.find('      {/* â”€â”€ Page Banner â”€â”€ */}')

end_idx = content.find('      <div id="calendar-section" className="max-w-7xl mx-auto px-6 py-8">')

if start_idx == -1 or end_idx == -1:
    print(f'Boundaries not found! start_idx={start_idx}, end_idx={end_idx}')
    sys.exit(1)

new_content = content[:start_idx] + hero_content + '\n' + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Success')
