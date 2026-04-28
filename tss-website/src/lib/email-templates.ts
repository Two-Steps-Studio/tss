/**
 * Email Templates for Two Steps Studio
 * Used for login tokens, password resets, and notifications
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Login Token Template (Polish)
 */
export const LOGIN_TOKEN_TEMPLATE_PL = {
  subject: 'Twój kod weryfikacyjny - Two Steps Studio',
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kod Weryfikacyjny</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 30px;">
    <h1 style="text-align: center;">Two Steps Studio</h1>
    <h2 style="text-align: center; color: #555; font-size: 18px;">Twój Kod Weryfikacyjny</h2>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <span style="font-family: monospace; font-size: 24px; letter-spacing: 4px; color: #667eea;"></span>
    </div>
    <p style="color: #666;">Wpisz ten kod w formularzu logowania.</p>
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 20px;">
      <strong>⚠️ Uwaga:</strong> Kod wygasza za 10 minut.
    </div>
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
      Two Steps Studio © 2024<br>
      <a href="https://two-steps-studio.pl">two-steps-studio.pl</a>
    </p>
  </div>
</body>
</html>`,
  text: 'Two Steps Studio - Twój kod weryfikacyjny to:\n\nTen kod wygasza za 10 minut.'
};
