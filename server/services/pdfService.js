const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Markdown benzeri metinleri HTML bullet point listesine çeviren süper yardımcı
Handlebars.registerHelper('bulletPoints', function(text) {
    if (!text) return '';
    
    // Satır sonlarına (newline), yıldızlara, veya bullet karakterlerine göre böl
    const lines = text.split(/\n|\*|•|·/g).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 1 && text.indexOf(':') === -1) {
       return new Handlebars.SafeString(`<p class="text-[10pt] text-gray-800 leading-snug">${Handlebars.Utils.escapeExpression(lines[0])}</p>`);
    }
    
    const listItems = lines.map(l => {
       // "Data Preprocessing: did something" gibi metinlerde iki nokta üstüsteye kadar olan kısmı bold yap
       const colonIndex = l.indexOf(':');
       if (colonIndex !== -1 && colonIndex < 50) { 
           const boldPart = l.substring(0, colonIndex + 1);
           const rest = l.substring(colonIndex + 1);
           return `<li class="mb-0.5"><span class="font-bold text-gray-900">${Handlebars.Utils.escapeExpression(boldPart)}</span>${Handlebars.Utils.escapeExpression(rest)}</li>`;
       }
       return `<li class="mb-0.5">${Handlebars.Utils.escapeExpression(l)}</li>`;
    }).join('');
    
    return new Handlebars.SafeString(`<ul class="list-disc ml-4 text-[10pt] text-gray-800 space-y-0">${listItems}</ul>`);
});

// Güvenli HTML render etmek için helper (Subtitle gibi yerlerde)
Handlebars.registerHelper('safe', function(text) {
    if (!text) return '';
    return new Handlebars.SafeString(text);
});

// Template verisini şablonun beklediği formata (Flatten) dönüştüren yardımcı fonksiyon
const prepareTemplateData = (cvData, entries) => {
    const contactInfo = entries.find(e => e.category === 'CONTACT_INFO') || {};
    const personalInfo = entries.find(e => e.category === 'PERSONAL_INFO') || {};
    
    // Veritabanındaki isim 'MEYDAN' olarak geldiyse veya parçalandıysa
    // Contact Info metadata veya personal info içinden tam ismi kurtarmaya çalışalım
    const rawName = cvData.userName || '';
    let fullName = personalInfo?.metadata?.fullName || contactInfo?.metadata?.fullName || rawName;

    const email = cvData.userEmail || contactInfo?.metadata?.email || '';

    // EĞER isim sadece küçük harf, tek kelime veya soyisim gibi duruyorsa (MEYDAN) 
    // ve e-posta adresinden (sude.meydan35@gmail.com) daha anlamlı bir ad-soyad çıkarabiliyorsak:
    if (fullName === rawName && email) {
        const emailPrefix = email.split('@')[0]; // "sude.meydan35"
        // rakamları sil ve noktalama işaretlerinden böl
        const nameParts = emailPrefix.replace(/[0-9]/g, '').split(/[\._]/).filter(p => p.length > 0);
        if (nameParts.length >= 2) {
            // "sude" "meydan" -> "Sude Meydan"
            fullName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        } else if (rawName === rawName.toUpperCase() && rawName.length > 2) {
            // MEYDAN -> Meydan
            fullName = rawName.charAt(0) + rawName.slice(1).toLowerCase();
        }
    }

    return {
        name: fullName || 'İsim Belirtilmemiş',
        email: email,
        phone: contactInfo?.metadata?.phone || '',
        linkedin: contactInfo?.metadata?.linkedin || '',
        github: contactInfo?.metadata?.github || '',
        portfolio: contactInfo?.metadata?.portfolio || '',
        address: contactInfo?.metadata?.address || '',
        birthDate: personalInfo?.metadata?.birthDate || contactInfo?.metadata?.birthDate || '',
        summary: cvData.summary || '',
        experiences: entries.filter(e => e.category === 'EXPERIENCE'),
        educations: entries.filter(e => e.category === 'EDUCATION'),
        skills: entries.filter(e => e.category === 'SKILL'),
        projects: entries.filter(e => e.category === 'PROJECT'),
        languages: entries.filter(e => e.category === 'LANGUAGE'),
        certificates: entries.filter(e => e.category === 'CERTIFICATE')
    };
};

const generateATSPDF = async (cvData, entries, templateName = 'classic') => {
    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    
    // Fallback to classic if requested template doesn't exist
    const finalTemplatePath = fs.existsSync(templatePath) 
        ? templatePath 
        : path.join(__dirname, '../templates/classic.hbs');

    const templateSource = fs.readFileSync(finalTemplatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    
    const templateData = prepareTemplateData(cvData, entries);
    const html = template(templateData);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
};

const generateTailoredPDF = async (cvData, tailoredData, templateName = 'classic') => {
    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    const finalTemplatePath = fs.existsSync(templatePath) 
        ? templatePath 
        : path.join(__dirname, '../templates/classic.hbs');

    const templateSource = fs.readFileSync(finalTemplatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    // Orijinal verileri kopyala
    let mixedEntries = [...cvData.entries];

    // Üzerine tailored verileri yaz (Eğer ID olsaydı daha iyi olurdu ama name eşleştiriyoruz)
    if (tailoredData.entries && tailoredData.entries.length > 0) {
        tailoredData.entries.forEach(te => {
            const existingIdx = mixedEntries.findIndex(ce => ce.title === te.name && ce.category === te.category);
            if (existingIdx !== -1) {
                mixedEntries[existingIdx] = {
                    ...mixedEntries[existingIdx],
                    title: te.name,
                    description: te.description
                };
            } else {
                mixedEntries.push({
                    title: te.name,
                    description: te.description,
                    category: te.category
                });
            }
        });
    }

    // YZ özetini al
    const finalCvData = {
        ...cvData,
        summary: tailoredData.improvedSummary || cvData.summary
    };

    const templateData = prepareTemplateData(finalCvData, mixedEntries);
    const html = template(templateData);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
};

module.exports = { generateATSPDF, generateTailoredPDF };
