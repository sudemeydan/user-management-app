import React from 'react';

const TemplateClassic = ({ cv }) => {
    if (!cv) return null;

    const { personalInfo, summary, entries } = cv;

    const skills = entries?.filter(e => e.category === 'SKILL') || [];
    const experiences = entries?.filter(e => e.category === 'EXPERIENCE') || [];
    const education = entries?.filter(e => e.category === 'EDUCATION') || [];

    // Helper to render links safely
    const renderLink = (url, label) => {
        if (!url) return null;
        const validUrl = url.startsWith('http') ? url : `https://${url}`;
        return (
            <a href={validUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {label || url}
            </a>
        );
    };

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black p-10 font-sans mx-auto box-border" style={{ fontSize: '11pt' }}>
            {/* Header / Personal Info */}
            <div className="text-center mb-6 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase mb-2">
                    {personalInfo?.firstName} {personalInfo?.lastName}
                </h1>
                <div className="text-sm space-x-2 flex justify-center flex-wrap">
                    {personalInfo?.email && <span>{renderLink(`mailto:${personalInfo.email}`, personalInfo.email)}</span>}
                    {personalInfo?.phone && (
                        <>
                            <span>|</span>
                            <span>{personalInfo.phone}</span>
                        </>
                    )}
                    {personalInfo?.linkedin && (
                        <>
                            <span>|</span>
                            <span>{renderLink(personalInfo.linkedin, 'LinkedIn')}</span>
                        </>
                    )}
                    {personalInfo?.github && (
                        <>
                            <span>|</span>
                            <span>{renderLink(personalInfo.github, 'GitHub')}</span>
                        </>
                    )}
                    {personalInfo?.portfolio && (
                        <>
                            <span>|</span>
                            <span>{renderLink(personalInfo.portfolio, 'Portfolio')}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Professional Summary</h2>
                    <p className="text-sm leading-relaxed">{summary}</p>
                </div>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Experience</h2>
                    <div className="space-y-4">
                        {experiences.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-md font-bold">{exp.title}</h3>
                                    <span className="text-sm font-semibold">{exp.startDate || ''} - {exp.endDate || 'Present'}</span>
                                </div>
                                <div className="text-sm font-semibold italic mb-1">{exp.subtitle}</div>
                                {exp.description && <p className="text-sm leading-relaxed">{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Education</h2>
                    <div className="space-y-3">
                        {education.map((edu, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-md font-bold">{edu.title}</h3>
                                    <span className="text-sm font-semibold">{edu.startDate || ''} - {edu.endDate || ''}</span>
                                </div>
                                <div className="text-sm italic mb-1">{edu.subtitle}</div>
                                {edu.description && <p className="text-sm leading-relaxed">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Skills</h2>
                    <div className="text-sm">
                         <p>
                            {skills.map(s => s.title + (s.subtitle ? ` (${s.subtitle})` : '')).join(', ')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateClassic;
