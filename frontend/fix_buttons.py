import os

cal_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\course_calender\page.tsx'
with open(cal_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix banner bg color
content = content.replace('<section className="relative overflow-hidden">', '<section className="relative overflow-hidden bg-[#031525] pb-10">')

# Fix buttons
old_buttons = '''              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    const el = document.getElementById("calendar-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white px-7 py-3.5 rounded-lg font-bold text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  VIEW UPCOMING BATCHES
                </button>
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="bg-white hover:bg-slate-50 text-[#0b1f3a] px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base tracking-wide flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <span>TALK TO COUNSELLOR</span>
                </button>
              </div>'''

new_buttons = '''              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-4">
                <button
                  onClick={() => {
                    const el = document.getElementById("calendar-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#f97316] hover:bg-[#ea580c] text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-black text-[12px] sm:text-[13px] tracking-wide uppercase shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  VIEW UPCOMING BATCHES
                </button>
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-[#0b1f3a] px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-black text-[12px] sm:text-[13px] tracking-wide uppercase transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 text-green-500 mr-2" />
                  TALK TO COUNSELLOR
                </button>
              </div>'''

if old_buttons in content:
    content = content.replace(old_buttons, new_buttons)
else:
    print("Old buttons not found exactly, doing fuzzy replace")
    # Fuzzy replace
    start = content.find('{/* CTA Buttons */}')
    end = content.find('</div>\n            </div>\n\n            {/* Right Form / Badges', start)
    if end == -1:
        end = content.find('</div>\n            </div>\n\n', start)
    
    if start != -1 and end != -1:
        content = content[:start] + new_buttons + '\n' + content[end:]

with open(cal_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
