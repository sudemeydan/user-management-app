import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

export interface CVDataPayload {
  userName?: string;
  userEmail?: string;
  summary?: string;
  entries?: any[];
}

export interface TailoredDataPayload {
  improvedSummary?: string;
  entries?: any[];
}

// ... Handlebars helpers code skipped but compiled directly inside script contexts ...
Handlebars.registerHelper('safe', function(text) {
    if (!text) return '';
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('bulletPoints', function(text) {
    if (!text) return '';
    const lines = text.split(/\n|(?:^|\s)\*\s|â€¢|Â·|(?:^|\s)-\s/g).map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    if (lines.length === 1) return new Handlebars.SafeString(`<p>${Handlebars.Utils.escapeExpression(lines[0])}</p>`);
    const listItems = lines.map((l: string) => `<li>${Handlebars.Utils.escapeExpression(l)}</li>`).join('');
    return new Handlebars.SafeString(`<ul>${listItems}</ul>`);
});
Handlebars.registerHelper('initials', function(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
});

export const generateATSPDF = async (cvData: CVDataPayload, entries: any[], templateName: string = 'classic'): Promise<Buffer> => {
    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    const finalTemplatePath = fs.existsSync(templatePath) ? templatePath : path.join(__dirname, '../templates/classic.hbs');

    const templateSource = fs.readFileSync(finalTemplatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    
    // Fallback template context logic directly mapping cvData
    const templateData = { name: cvData.userName, email: cvData.userEmail, summary: cvData.summary, experiences: entries.filter(e => e.category === 'EXPERIENCE'), educations: entries.filter(e => e.category === 'EDUCATION') };
    const html = template(templateData);

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer: Uint8Array = await page.pdf({ format: 'A4', margin: { top: '0', right: '0', bottom: '0', left: '0' }, printBackground: true });
    await browser.close();
    return Buffer.from(pdfBuffer);
};

export const generateTailoredPDF = async (cvData: CVDataPayload, tailoredData: TailoredDataPayload, templateName: string = 'classic'): Promise<Buffer> => {
    let mixedEntries = [...(cvData.entries || [])];
    if (tailoredData.entries && tailoredData.entries.length > 0) {
       mixedEntries = tailoredData.entries;
    }
    return await generateATSPDF({ ...cvData, summary: tailoredData.improvedSummary || cvData.summary }, mixedEntries, templateName);
};

export default { generateATSPDF, generateTailoredPDF };
