import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TemplateClassic from './cv-templates/TemplateClassic';

const RenderCVPage = () => {
    const [cvData, setCvData] = useState(null);
    const [error, setError] = useState(null);

    const pathParts = window.location.pathname.split('/');
    const cvId = pathParts[2]; // /render-cv/123

    const urlParams = new URLSearchParams(window.location.search);
    const template = urlParams.get('template') || 'classic';
    const token = urlParams.get('token'); // Temporary auth token provided by backend for puppeteer

    useEffect(() => {
        const fetchCVData = async () => {
            try {
                // Fetch specific CV data from backend using the temporary token
                const response = await axios.get(`http://127.0.0.1:3001/users/cvs/${cvId}/render-data`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCvData(response.data.data);
            } catch (err) {
                console.error("Failed to load CV data for render", err);
                setError(err.response?.data?.message || err.message);
            }
        };

        if (cvId && token) {
            fetchCVData();
        } else {
            setError("Missing cvId or token parameters.");
        }
    }, [cvId, token]);

    if (error) {
        return <div className="p-10 text-red-500 font-bold">Error rendering CV: {error}</div>;
    }

    if (!cvData) {
        return <div className="p-10 text-gray-500">Loading CV Data...</div>;
    }

    // Seçilen şablona göre render
    if (template === 'classic') {
        return <TemplateClassic cv={cvData} />;
    }

    // Default template fallback
    return <TemplateClassic cv={cvData} />;
};

export default RenderCVPage;
