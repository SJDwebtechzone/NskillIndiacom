const fs = require('fs');
const lines = fs.readFileSync('C:/Users/ragul/.gemini/antigravity/brain/564c35db-fe81-4947-b05a-36337eff1f77/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  if (!line.includes('"type":"TOOL_RESPONSE"')) continue;
  try {
    const parsed = JSON.parse(line.substring(line.indexOf('{')));
    if (parsed.type === "TOOL_RESPONSE") {
      for (const res of parsed.tool_responses || []) {
        if (res.name === "run_command" && res.output && res.output.includes("truncated 571 lines")) {
          fs.writeFileSync('extracted_diff.txt', res.output, 'utf8');
          console.log("Saved the diff!");
          process.exit(0);
        }
      }
    }
  } catch(e) {}
}
