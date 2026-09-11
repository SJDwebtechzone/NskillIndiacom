import os

courses_path = r'd:\Devspectra\Nskill\NskillIndiacom\frontend\app\courses\page.tsx'

with open(courses_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '      {/* ─── Next Available Batches & Search ───────────────────────────────────── */}'
if start_marker not in content:
    start_marker = content[content.find('      {/* '):content.find(' Next Available Batches & Search')+30]

end_marker = '      {/* ─── Browse Courses by Category ─────────────────────────────────────── */}'
if end_marker not in content:
    end_marker = '      {/* â”€â”€â”€ Browse Courses by Category â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Markers not found! start:', start_idx, 'end:', end_idx)
    import sys; sys.exit(1)

extracted_section = content[start_idx:end_idx]

original_search_bar = '''      {/* ─── Floating Elevated Search Bar ───────────────────────────────────── */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12 relative z-30 -mt-7 mb-10">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.08)] p-2.5 md:p-3 flex items-center gap-3 border border-slate-100"
        >
          <div className="bg-[#0b1f3a] p-3 rounded-xl text-white shrink-0 hidden sm:flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 flex-1 px-2">
            <Search className="w-5 h-5 text-slate-400 sm:hidden shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for a course, skill or career..."
              className="w-full text-slate-800 placeholder:text-slate-400 font-medium text-sm md:text-base outline-none bg-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setAppliedSearch("");
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 md:px-8 py-3.5 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-colors shrink-0 cursor-pointer"
          >
            SEARCH COURSES
          </button>
        </form>
      </div>

'''

new_content = content[:start_idx] + original_search_bar + content[end_idx:]

with open(courses_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

with open('extracted_section.txt', 'w', encoding='utf-8') as f:
    f.write(extracted_section)

print('Success')
