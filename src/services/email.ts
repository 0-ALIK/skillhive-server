import { createTransport } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

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

interface ConfirmarCorreoData {
    nombre: string;
    apellido?: string;
    codigo: string;
}

/**
 * Email service
 */
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

    /**
     * Send an email
     * @param options EmailOptions
     * @returns Promise<boolean>
     */
    public static async sendEmail(options: EmailOptions): Promise<boolean> {
        try {

            const { to, subject, html, attachements = [] } = options;

            await this.transporter.sendMail({
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

    public static async sendConfirmarCorreo(to: string, subject: string, replacements: ConfirmarCorreoData) {
        const email = fs.readFileSync(path.join(__dirname, '../emails/confirmar-correo.hbs'), 'utf-8');
        const template = handlebars.compile(email);

        try {
            
            await this.sendEmail({
                to: to,
                subject: subject,
                html: template(replacements)
            });

            return true;

        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
}