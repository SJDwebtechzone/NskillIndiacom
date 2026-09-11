import os

courses_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\courses\page.tsx'
cal_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\course_calender\page.tsx'

with open(courses_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('fetch(/api/course_events)', 'fetch(${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/course_events)')
content = content.replace('  return   ;\n', '')
content = content.replace('href={/courses/}', 'href={/courses/}')

with open(courses_path, 'w', encoding='utf-8') as f:
    f.write(content)

with open(cal_path, 'r', encoding='utf-8') as f:
    cal_content = f.read()

cal_content = cal_content.replace('            >â€¹</button>\n', '')
cal_content = cal_content.replace('            >â€º</button>\n', '')
cal_content = cal_content.replace('              >Ã—</button>\n', '')
cal_content = cal_content.replace('            <div className="py-24 text-center text-slate-400 animate-pulse text-base">Loading scheduleâ€¦</div>\n', '')

with open(cal_path, 'w', encoding='utf-8') as f:
    f.write(cal_content)
