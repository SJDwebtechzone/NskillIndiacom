import os

cal_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\course_calender\page.tsx'

with open(cal_path, 'r', encoding='utf-8') as f:
    content = f.read()

with open('extracted_section.txt', 'r', encoding='utf-8') as f:
    extracted_section = f.read()

# Add imports for Link and Search, MapPin, Calendar, Clock if missing
imports_to_add = "import Link from 'next/link';\nimport { Search, MapPin, Calendar, Clock } from 'lucide-react';\n"
if 'import Link' not in content:
    content = content.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\n' + imports_to_add)

# Add helper functions outside the component
helpers = '''
function formatEventDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return ${d.getDate().toString().padStart(2, "0")}  ;
}
function getCourseMeta(course: any) {
  return { time: "10:00 AM - 02:00 PM" };
}
'''
if 'function formatEventDate' not in content:
    content = content.replace('type EventType = "batch1" | "batch2" | "both";', helpers + '\ntype EventType = "batch1" | "batch2" | "both";')

# Add states inside the component
states = '''
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedMode, setSelectedMode] = useState("All Training Modes");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch(${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses)
      .then(r => r.json())
      .then(data => { if(Array.isArray(data)) setCourses(data); })
      .catch(console.error);
  }, []);

  const handleOpenEnquiry = (courseName: string) => {
    setDemoForm(prev => ({ ...prev, course_id: courseName }));
    setShowEnquiryModal(true);
  };
'''
if 'const [searchInput' not in content:
    content = content.replace('const [error,        setError]        = useState("");', 'const [error,        setError]        = useState("");\n' + states)

# Add the extracted section below the calendar banner
target_marker = '      <div id="calendar-section"'
if target_marker in content:
    content = content.replace(target_marker, extracted_section + '\n\n' + target_marker)
else:
    print('Target marker not found!')

# In extracted section, we need to handle "handleSearchSubmit"
# The form has onSubmit={handleSearchSubmit}. Let's define it simply.
handle_search = '''
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = /courses?search=;
  };
'''
if 'const handleSearchSubmit' not in content:
    content = content.replace('const handleDemoSubmit = async', handle_search + '\n  const handleDemoSubmit = async')

with open(cal_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
