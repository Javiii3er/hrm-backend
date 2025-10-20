"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = void 0;
// src/core/utils/security.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class SecurityUtils {
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcryptjs_1.default.hash(password, saltRounds);
    }
    static async comparePassword(password, hash) {
        return await bcryptjs_1.default.compare(password, hash);
    }
    static generateRandomToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.SecurityUtils = SecurityUtils;
//# sourceMappingURL=security.js.map