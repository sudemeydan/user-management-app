"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tailoringService_1 = __importDefault(require("../services/tailoringService"));
const createJobPosting = async (req, res, next) => {
    try {
        const { jobText, url } = req.body;
        if (!jobText && !url) {
            res.status(400).json({ success: false, message: "İş ilanı metni veya URL gereklidir." });
            return;
        }
        const jobPosting = await tailoringService_1.default.createJobPosting(url, jobText, req.body.role);
        res.json({ success: true, message: "İş ilanı başarıyla kaydedildi!", data: jobPosting });
    }
    catch (error) {
        next(error);
    }
};
const getTailoringProposals = async (req, res, next) => {
    try {
        const proposals = await tailoringService_1.default.getTailoringProposals(req.user?.id, req.params.cvId, req.params.jobPostingId);
        res.json({ success: true, data: proposals });
    }
    catch (error) {
        next(error);
    }
};
const createTailoredCV = async (req, res, next) => {
    try {
        const { originalCvId, jobPostingId, improvedSummary, approvedProposals, atsScore } = req.body;
        const userId = req.user?.id;
        const tailoredCV = await tailoringService_1.default.createTailoredCV(userId, originalCvId, jobPostingId, {
            improvedSummary: improvedSummary,
            atsScore: atsScore || null,
            updatedEntries: approvedProposals?.map((p) => ({
                originalEntryId: parseInt(p.entryId),
                title: p.suggestedTitle,
                content: p.suggestedDescription,
                aiComment: p.aiComment
            }))
        });
        res.json({ success: true, message: "Uyarlanmış CV başarıyla oluşturuldu!", data: tailoredCV });
    }
    catch (error) {
        next(error);
    }
};
const optimizeTailoredCV = async (req, res, next) => {
    try {
        const tailoredCvId = req.params.tailoredCvId;
        const userId = req.user?.id;
        const result = await tailoringService_1.default.optimizeTailoredCV(userId, tailoredCvId);
        res.json({ success: true, message: "Uyarlanmış CV PDF'i oluşturuldu!", data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createJobPosting,
    getTailoringProposals,
    createTailoredCV,
    optimizeTailoredCV
};
