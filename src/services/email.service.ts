import { createTransport } from 'nodemailer';

type EmailOptions = {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
};


export class EmailService {

    private static transporter = createTransport({
        service: process.env.MAIL_SERVICE,
        port: Number(process.env.MAIL_PORT),
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    public static async sendEmail() {
    }

    
}