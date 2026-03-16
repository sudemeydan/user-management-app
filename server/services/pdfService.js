const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generateATSPDF = async (cvData, entries) => {
    let html = fs.readFileSync(path.join(__dirname, '../templates/ats_cv.html'), 'utf8');

    // Simple replacement logic (can be replaced with a real template engine like Handlebars)
    html = html.replace('{{name}}', cvData.userName || 'İsim Belirtilmemiş');
    html = html.replace('{{email}}', cvData.userEmail || '');
    html = html.replace('{{summary}}', cvData.summary || '');
    
    // Extract contact info from entries if not present in cvData
    const contactInfo = entries.find(e => e.category === 'CONTACT_INFO');
    html = html.replace('{{phone}}', contactInfo?.metadata?.phone || '');
    html = html.replace('{{address}}', contactInfo?.metadata?.address || '');
    html = html.replace('{{linkedin}}', contactInfo?.metadata?.linkedin || '');

    // Handle Sections
    const categories = {
        '#experiences': 'EXPERIENCE',
        '#educations': 'EDUCATION',
        '#skills': 'SKILL',
        '#projects': 'PROJECT'
    };

    for (const [selector, category] of Object.entries(categories)) {
        const categoryEntries = entries.filter(e => e.category === category);
        let sectionHtml = '';
        
        if (category === 'SKILL') {
            sectionHtml = categoryEntries.map(e => `<span class="skill-item">${e.title}</span>`).join('');
            html = html.replace('{{#skills}}', '').replace('{{/skills}}', '').replace(/<span class="skill-item">\{\{title\}\}<\/span>/g, sectionHtml);
        } else {
            sectionHtml = categoryEntries.map(e => `
                <div class="entry">
                    <div class="entry-header">
                        <span>${e.title}</span>
                        <span>${e.startDate || ''} - ${e.endDate || 'Present'}</span>
                    </div>
                    ${e.subtitle ? `<div class="entry-subtitle">${e.subtitle}</div>` : ''}
                    <div class="description">${e.description || ''}</div>
                </div>
            `).join('');
            
            // This is a rough replacement, real template engine would be better
            const regex = new RegExp(`{{#${category.toLowerCase()}s}}[\\s\\S]*?{{\\/${category.toLowerCase()}s}}`, 'g');
            html = html.replace(regex, sectionHtml);
        }
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
};

const generateTailoredPDF = async (cvData, tailoredData) => {
    let html = fs.readFileSync(path.join(__dirname, '../templates/ats_cv.html'), 'utf8');

    // Başlık ve Temel Bilgiler
    html = html.replace('{{name}}', cvData.userName || 'İsim Belirtilmemiş');
    html = html.replace('{{email}}', cvData.userEmail || '');
    // YZ tarafından iyileştirilmiş özeti kullan, yoksa orijinalini kullan
    html = html.replace('{{summary}}', tailoredData.improvedSummary || cvData.summary || '');
    
    // İletişim Bilgileri (Orijinal CV'den)
    const contactInfo = cvData.entries.find(e => e.category === 'CONTACT_INFO');
    html = html.replace('{{phone}}', contactInfo?.metadata?.phone || '');
    html = html.replace('{{address}}', contactInfo?.metadata?.address || '');
    html = html.replace('{{linkedin}}', contactInfo?.metadata?.linkedin || '');

    // Bölümler
    const categories = {
        '#experiences': 'EXPERIENCE',
        '#educations': 'EDUCATION',
        '#skills': 'SKILL',
        '#projects': 'PROJECT'
    };

    for (const [selector, category] of Object.entries(categories)) {
        // Orijinal entryleri al
        let categoryEntries = cvData.entries.filter(e => e.category === category);
        
        // Eğer bu kategori için tailored (uyarlanmış) bir teklif varsa, orijinal listedekini bulup güncelle veya ekle
        if (tailoredData.entries && tailoredData.entries.length > 0) {
            const tailoredInCategory = tailoredData.entries.filter(te => te.category === category);
            
            tailoredInCategory.forEach(te => {
                // Not: TailoredCVEntry'de originalEntryId saklamıyoruz ama 'name' (title) üzerinden eşleştirebiliriz 
                // ya da direkt hepsini tailored'dan alabiliriz. 
                // Ancak tailoredData sadece DEĞİŞENLERİ içeriyor olabilir.
                // Şimdilik basitleştirmek adına: Eğer tailored'da varsa onu kullan, yoksa orijinali kalsın.
                const existingIdx = categoryEntries.findIndex(ce => ce.title === te.name);
                if (existingIdx !== -1) {
                    categoryEntries[existingIdx] = {
                        ...categoryEntries[existingIdx],
                        title: te.name,
                        description: te.description
                    };
                } else {
                    // Yeni bir entry olarak ekle (eğer tailored'da varsa ve orijinalde yoksa)
                    categoryEntries.push({
                        title: te.name,
                        description: te.description,
                        category: te.category
                    });
                }
            });
        }

        let sectionHtml = '';
        if (category === 'SKILL') {
            sectionHtml = categoryEntries.map(e => `<span class="skill-item">${e.title}</span>`).join('');
            // HTML temizleme
            html = html.replace('{{#skills}}', '').replace('{{/skills}}', '').replace(/<span class="skill-item">\{\{title\}\}<\/span>/g, sectionHtml);
        } else {
            sectionHtml = categoryEntries.map(e => `
                <div class="entry">
                    <div class="entry-header">
                        <span>${e.title}</span>
                        <span>${e.startDate || ''} - ${e.endDate || 'Present'}</span>
                    </div>
                    ${e.subtitle ? `<div class="entry-subtitle">${e.subtitle}</div>` : ''}
                    <div class="description">${e.description || ''}</div>
                </div>
            `).join('');
            
            const regex = new RegExp(`{{#${category.toLowerCase()}s}}[\\s\\S]*?{{\\/${category.toLowerCase()}s}}`, 'g');
            html = html.replace(regex, sectionHtml);
        }
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
};

module.exports = { generateATSPDF, generateTailoredPDF };
