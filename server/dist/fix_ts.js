"use strict";
const fs = require('fs');
let code = fs.readFileSync('services/userService.ts', 'utf8');
// replace common requires with imports
code = code.replace(/const (\w+) = require\(['"]([^'"]+)['"]\);/g, 'import $1 from \'$2\';');
code = code.replace(/const \{ ([^}]+) \} = require\(['"]([^'"]+)['"]\);/g, 'import { $1 } from \'$2\';');
// handle any custom destructuring lines cleanly
code = code.replace(/import \{ extractJobDetails, generateTailoringProposals \} from '\.\/geminiService';/, "import { extractJobDetails, generateTailoringProposals } from './geminiService';");
// replace module.exports
code = code.replace(/module\.exports = \{/g, 'export default {');
// explicitly type parameters as any
code = code.replace(/const (\w+) = async \(([^)]+)\) =>/g, (match, name, params) => {
    const typedParams = params.split(',').map(p => {
        let pName = p.trim();
        if (!pName)
            return '';
        if (pName.includes('='))
            return pName; // already has default, inferred
        if (pName.includes(':'))
            return pName; // already typed
        if (pName.startsWith('{'))
            return pName + ': any'; // destructuring
        return pName + ': any';
    }).filter(p => p !== '').join(', ');
    return `const ${name} = async (${typedParams}) =>`;
});
fs.writeFileSync('services/userService.ts', code);
console.log('Fixed userService.ts');
