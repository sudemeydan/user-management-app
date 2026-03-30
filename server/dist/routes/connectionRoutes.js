"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectionController_1 = __importDefault(require("../controllers/connectionController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
router.post('/request', authMiddleware_1.default, connectionController_1.default.sendRequest);
router.put('/accept/:id', authMiddleware_1.default, connectionController_1.default.acceptRequest);
router.delete('/remove/:id', authMiddleware_1.default, connectionController_1.default.rejectOrRemoveRequest);
exports.default = router;
