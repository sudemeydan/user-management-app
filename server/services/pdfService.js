const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// ==================== HANDLEBARS HELPERS ====================

// Markdown benzeri metinleri HTML bullet point listesine çeviren helper
Handlebars.registerHelper('bulletPoints', function(text) {
    if (!text) return '';
    
    const lines = text.split(/\n|(?:^|\s)\*\s|•|·|(?:^|\s)-\s/g)
        .map(l => l.trim())
        .filter(l => l.length > 0);
    
    if (lines.length === 1) {
       return new Handlebars.SafeString(`<p>${Handlebars.Utils.escapeExpression(lines[0])}</p>`);
    }
    
    const listItems = lines.map(l => {
       const colonIndex = l.indexOf(':');
       if (colonIndex !== -1 && colonIndex < 50) { 
           const boldPart = l.substring(0, colonIndex + 1);
           const rest = l.substring(colonIndex + 1);
           return `<li><strong>${Handlebars.Utils.escapeExpression(boldPart)}</strong>${Handlebars.Utils.escapeExpression(rest)}</li>`;
       }
       return `<li>${Handlebars.Utils.escapeExpression(l)}</li>`;
    }).join('');
    
    return new Handlebars.SafeString(`<ul>${listItems}</ul>`);
});

// Güvenli HTML render helper
Handlebars.registerHelper('safe', function(text) {
    if (!text) return '';
    return new Handlebars.SafeString(text);
});

// İsmin baş harflerini çıkaran helper (Avatar için)
Handlebars.registerHelper('initials', function(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
});

// Link'leri düzgün URL formatına çeviren helper
Handlebars.registerHelper('formatLink', function(value, type) {
    if (!value) return '#';
    
    const v = value.trim();
    
    if (v.startsWith('http://') || v.startsWith('https://')) {
        return v;
    }
    
    switch(type) {
        case 'linkedin':
            if (v.includes('linkedin.com')) return `https://${v}`;
            return `https://linkedin.com/in/${v}`;
        case 'github':
            if (v.includes('github.com')) return `https://${v}`;
            return `https://github.com/${v}`;
        case 'url':
            return `https://${v}`;
        default:
            return v;
    }
});

// ==================== LANGUAGE DETECTION ====================

// CV içeriğinin dilini tespit eden fonksiyon
const detectLanguage = (entries, summary) => {
    // Tüm metinleri birleştir
    let allText = (summary || '').toLowerCase();
    entries.forEach(e => {
        if (e.description) allText += ' ' + e.description.toLowerCase();
        if (e.title) allText += ' ' + e.title.toLowerCase();
        if (e.subtitle) allText += ' ' + e.subtitle.toLowerCase();
    });

    // Türkçeye özgü kelimeler ve harfler
    const turkishIndicators = [
        'deneyim', 'eğitim', 'üniversite', 'proje', 'yetenek', 
        'şirket', 'staj', 'lisans', 'mühendis', 'geliştirici',
        'bölüm', 'fakülte', 'öğrenci', 'devam ediyor', 'sorumlu',
        'olarak', 'görev', 'çalış', 'oluştur', 'geliştir',
        'ğ', 'ş', 'ç', 'ı', 'ö', 'ü'
    ];

    const englishIndicators = [
        'experience', 'education', 'university', 'project', 'skill',
        'company', 'internship', 'bachelor', 'engineer', 'developer',
        'department', 'faculty', 'student', 'present', 'responsible',
        'worked', 'developed', 'created', 'managed', 'implemented',
        'proficiency', 'achieved', 'collaborated'
    ];

    let turkishScore = 0;
    let englishScore = 0;

    turkishIndicators.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const matches = allText.match(regex);
        if (matches) turkishScore += matches.length;
    });

    englishIndicators.forEach(word => {
        const regex = new RegExp(word, 'gi');
        const matches = allText.match(regex);
        if (matches) englishScore += matches.length;
    });

    return englishScore > turkishScore ? 'en' : 'tr';
};

// Dile göre bölüm başlıkları
const getLabels = (lang) => {
    if (lang === 'en') {
        return {
            contact: 'Contact',
            skills: 'Skills',
            languages: 'Languages',
            certificates: 'Certificates',
            profile: 'Professional Summary',
            experience: 'Experience',
            education: 'Education',
            projects: 'Projects',
            present: 'Present',
            nameNotProvided: 'Name Not Provided'
        };
    }
    return {
        contact: 'İletişim',
        skills: 'Yetenekler',
        languages: 'Diller',
        certificates: 'Sertifikalar',
        profile: 'Profesyonel Özet',
        experience: 'Deneyim',
        education: 'Eğitim',
        projects: 'Projeler',
        present: 'Devam Ediyor',
        nameNotProvided: 'İsim Belirtilmemiş'
    };
};

// ==================== DATA PREPARATION ====================

const prepareTemplateData = (cvData, entries) => {
    const contactInfo = entries.find(e => e.category === 'CONTACT_INFO') || {};
    const personalInfo = entries.find(e => e.category === 'PERSONAL_INFO') || {};
    
    // 1. Öncelik: CV içindeki metadata'dan isim al
    let fullName = contactInfo?.metadata?.fullName 
        || personalInfo?.metadata?.fullName 
        || null;

    const email = cvData.userEmail || contactInfo?.metadata?.email || '';
    const rawName = cvData.userName || '';

    // 2. Eğer metadata'da isim yoksa, kullanıcı adını kullan
    if (!fullName) {
        fullName = rawName;
    }

    // 3. Son çare: e-postadan isim çıkar
    if ((!fullName || fullName === rawName) && email && (!rawName || rawName.length <= 3 || rawName === rawName.toUpperCase())) {
        const emailPrefix = email.split('@')[0];
        const nameParts = emailPrefix.replace(/[0-9]/g, '').split(/[\._]/).filter(p => p.length > 0);
        if (nameParts.length >= 2) {
            fullName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        } else if (rawName && rawName === rawName.toUpperCase() && rawName.length > 2) {
            fullName = rawName.charAt(0) + rawName.slice(1).toLowerCase();
        }
    }

    // Dil tespiti
    const lang = detectLanguage(entries, cvData.summary);
    const labels = getLabels(lang);

    return {
        name: fullName || labels.nameNotProvided,
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
        certificates: entries.filter(e => e.category === 'CERTIFICATE'),
        // Dil etiketleri
        labels: labels,
        lang: lang
    };
};

// ==================== PDF GENERATION ====================

const generateATSPDF = async (cvData, entries, templateName = 'classic') => {
    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    
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

    let mixedEntries = [...cvData.entries];

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
