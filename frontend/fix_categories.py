import os

cal_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\course_calender\page.tsx'
with open(cal_path, 'r', encoding='utf-8') as f:
    content = f.read()

categories_data = '''const CATEGORIES_DATA = [
  { name: "Welding" },
  { name: "HVAC & Refrigeration" },
  { name: "Electrical" },
  { name: "Plumbing" },
  { name: "MEP" },
  { name: "Quality" },
  { name: "Safety" },
  { name: "Home Appliance" },
  { name: "Oil & Gas" },
];
'''

# Put it right above getCourseMeta
content = content.replace('function getCourseMeta', categories_data + '\nfunction getCourseMeta')

# Also import ChevronDown from lucide-react if not present
if 'ChevronDown' not in content:
    content = content.replace('ChevronRight, Loader2', 'ChevronRight, ChevronDown, Loader2')

with open(cal_path, 'w', encoding='utf-8') as f:
    f.write(content)
