"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTailoredPDF = exports.generateATSPDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
// ... Handlebars helpers code skipped but compiled directly inside script contexts ...
handlebars_1.default.registerHelper('safe', function (text) {
    if (!text)
        return '';
    return new handlebars_1.default.SafeString(text);
});
handlebars_1.default.registerHelper('bulletPoints', function (text) {
    if (!text)
        return '';
    const lines = text.split(/\n|(?:^|\s)\*\s|•|·|(?:^|\s)-\s/g).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 1)
        return new handlebars_1.default.SafeString(`<p>${handlebars_1.default.Utils.escapeExpression(lines[0])}</p>`);
    const listItems = lines.map((l) => `<li>${handlebars_1.default.Utils.escapeExpression(l)}</li>`).join('');
    return new handlebars_1.default.SafeString(`<ul>${listItems}</ul>`);
});
handlebars_1.default.registerHelper('initials', function (name) {
    if (!name)
        return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
});
const generateATSPDF = async (cvData, entries, templateName = 'classic') => {
    const templatePath = path_1.default.join(__dirname, `../templates/${templateName}.hbs`);
    const finalTemplatePath = fs_1.default.existsSync(templatePath) ? templatePath : path_1.default.join(__dirname, '../templates/classic.hbs');
    const templateSource = fs_1.default.readFileSync(finalTemplatePath, 'utf8');
    const template = handlebars_1.default.compile(templateSource);
    // Fallback template context logic directly mapping cvData
    const templateData = { name: cvData.userName, email: cvData.userEmail, summary: cvData.summary, experiences: entries.filter(e => e.category === 'EXPERIENCE'), educations: entries.filter(e => e.category === 'EDUCATION') };
    const html = template(templateData);
    const browser = await puppeteer_1.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '0', right: '0', bottom: '0', left: '0' }, printBackground: true });
    await browser.close();
    return Buffer.from(pdfBuffer);
};
exports.generateATSPDF = generateATSPDF;
const generateTailoredPDF = async (cvData, tailoredData, templateName = 'classic') => {
    let mixedEntries = [...(cvData.entries || [])];
    if (tailoredData.entries && tailoredData.entries.length > 0) {
        mixedEntries = tailoredData.entries;
    }
    return await (0, exports.generateATSPDF)({ ...cvData, summary: tailoredData.improvedSummary || cvData.summary }, mixedEntries, templateName);
};
exports.generateTailoredPDF = generateTailoredPDF;
exports.default = { generateATSPDF: exports.generateATSPDF, generateTailoredPDF: exports.generateTailoredPDF };
