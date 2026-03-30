"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tailoringController_1 = __importDefault(require("../controllers/tailoringController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
router.post('/job-postings', authMiddleware_1.default, tailoringController_1.default.createJobPosting);
router.get('/cvs/:cvId/tailor/:jobPostingId', authMiddleware_1.default, tailoringController_1.default.getTailoringProposals);
router.post('/tailored-cvs', authMiddleware_1.default, tailoringController_1.default.createTailoredCV);
router.post('/tailored-cvs/:tailoredCvId/optimize', authMiddleware_1.default, tailoringController_1.default.optimizeTailoredCV);
exports.default = router;
