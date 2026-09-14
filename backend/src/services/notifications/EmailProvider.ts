export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<void>;
}

export class DevelopmentEmailProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload) {
    console.log(`[DEV EMAIL] 📧 To: ${payload.to} | Subj: ${payload.subject}`);
    console.log(`[DEV EMAIL] Body: ${payload.body.substring(0, 50)}...`);
  }
}
