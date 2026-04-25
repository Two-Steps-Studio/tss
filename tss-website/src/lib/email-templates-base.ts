export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
