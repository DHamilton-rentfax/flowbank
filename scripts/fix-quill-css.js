const fs = require("fs");
const path = require("path");

// Files you specifically mentioned
const seedFiles = [
  "src/app/admin/blog/AdminBlogPageContent.tsx",
  "src/app/blog/[slug]/page.tsx",
];

// Recursively scan src/ for any lingering bad imports too
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (/\.(t|j)sx?$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

const BAD = /.*react-quill\/dist\/quill\.snow\.css.*\r?\n?/g; // <-- corrected escaping and added \r? for Windows line endings
let touched = 0;

// Combine explicit files + discovered files
const files = [...new Set([...seedFiles.filter(fs.existsSync), ...walk("src")])];

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (BAD.test(src)) {
    const out = src.replace(BAD, "");
    fs.writeFileSync(f, out);
    console.log("Fixed:", f);
    touched++;
  }
}
if (!touched) {
  console.log("No old imports found. You’re clean ✅");
} else {
  console.log(`Removed bad import from ${touched} file(s).`);
}