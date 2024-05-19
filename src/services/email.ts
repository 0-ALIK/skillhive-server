import { createTransport } from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachements?: Attachment[];
}

interface Attachment {
    filename: string;
    path: string;
}

/**
 * Email service
 */
export class EmailService {

    private transporter = createTransport({
        service: process.env.MAIL_SERVICE,
        port: Number(process.env.MAIL_PORT),
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    /**
     * Send an email
     * @param options EmailOptions
     * @returns Promise<boolean>
     */
    public async sendEmail(options: EmailOptions): Promise<boolean> {
        try {

            const { to, subject, html, attachements = [] } = options;

            const sendInformation = await this.transporter.sendMail({
                to: to,
                subject: subject,
                html: html,
                attachments: attachements
            });

            return true;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    
}