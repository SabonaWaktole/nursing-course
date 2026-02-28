const fs = require('fs');
const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

let tags = [];
const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('//') || line.includes('/*') || line.includes('*/')) continue;
    
    let regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
    while ((match = regex.exec(line)) !== null) {
        if (line.substring(match.index, match.index + match[0].length).includes('/>')) continue;
        
        let tagName = match[1];
        if (['br', 'img', 'input', 'hr', 'meta'].includes(tagName)) continue;

        if (match[0].startsWith('</')) {
            if (tags.length === 0) {
                console.log(`Unmatched closing tag </${tagName}> at line ${i + 1}`);
                process.exit(1);
            }
            let lastTag = tags.pop();
            if (lastTag.name !== tagName) {
                console.log(`Mismatch: Expected </${lastTag.name}> but found </${tagName}> at line ${i + 1}`);
                console.log(`Opened at ${lastTag.line}`);
                process.exit(1);
            }
        } else {
            tags.push({ name: tagName, line: i + 1 });
        }
    }
}

if (tags.length > 0) {
    console.log(`Unmatched opening tag <${tags[0].name}> at line ${tags[0].line}`);
} else {
    console.log("All tags matched!");
}
