import axios from "axios";


export class SmtpEmailProvider {
  private apiKey = process.env.SMTP_API_KEY;
  private apiUrl = 'https://api.embluemail.com/v2/email/send';

  async sendEmail(to: string, subject: string, body: string, from: string) {
    const emailResponse = await axios.post(this.apiUrl, {
        to: to,
        html: body,
        subject: subject,
        from: from,
        deliveryType: 'transaction'
      }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return emailResponse;
  }
}
