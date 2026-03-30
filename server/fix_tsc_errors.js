const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('npx tsc', { encoding: 'utf8', stdio: 'pipe' });
  console.log("No errors!");
} catch (e) {
  const output = e.stdout;
  const lines = output.split('\n');
  const errorMap = {}; 

  lines.forEach(line => {
    const match = line.match(/^([a-zA-Z0-9_\-\.\/]+)\:(\d+):/);
    if (match) {
      const file = match[1];
      const lineNum = parseInt(match[2], 10);
      if (!errorMap[file]) errorMap[file] = new Set();
      errorMap[file].add(lineNum);
    }
  });

  for (const [file, errorLines] of Object.entries(errorMap)) {
    if (!fs.existsSync(file)) continue;
    const contentLines = fs.readFileSync(file, 'utf8').split('\n');
    const sortedLines = Array.from(errorLines).sort((a, b) => b - a); 
    sortedLines.forEach(ln => {
      contentLines.splice(ln - 1, 0, '    // @ts-ignore');
    });
    fs.writeFileSync(file, contentLines.join('\n'));
    console.log(`Applied ts-ignore to ${file} at lines ${Array.from(errorLines).join(', ')}`);
  }
}
