"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelopmentEmailProvider = void 0;
class DevelopmentEmailProvider {
    async sendEmail(payload) {
        console.log(`[DEV EMAIL] 📧 To: ${payload.to} | Subj: ${payload.subject}`);
        console.log(`[DEV EMAIL] Body: ${payload.body.substring(0, 50)}...`);
    }
}
exports.DevelopmentEmailProvider = DevelopmentEmailProvider;
