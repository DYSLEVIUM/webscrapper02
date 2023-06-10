import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import path from 'path';
import { logger } from '../utils/logger';

export abstract class MailTransporter {
    protected transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null =
        null;
    private readonly receivers: string;

    constructor(
        protected readonly sender: string,
        protected password: string,
        receivers: string[]
    ) {
        this.receivers = receivers.join(', ');
    }

    abstract init(): Promise<boolean>;

    async sendMail(
        subject: string,
        text: string,
        attachmentPaths: string[] = []
    ) {
        if (!this.transporter) await this.init();

        const mailOptions = {
            from: this.sender,
            to: this.receivers,
            subject: subject,
            html: `<b>${text}</b>`,
            attachments: attachmentPaths.map((attachmentPath) => {
                return {
                    filename: path.basename(attachmentPath),
                    path: attachmentPath,
                };
            }),
        };

        if (!this.transporter) {
            throw new Error('Sending mail before transporter is initialized');
        }

        await this.transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            logger.info(
                `Email sent from ${this.sender} to ${this.receivers} with response: ${info.response}.`
            );
        });
    }
}

export class GmailTransporter extends MailTransporter {
    constructor(sender: string, password: string, receivers: string[]) {
        super(sender, password, receivers);
    }

    init() {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                this.transporter = await nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: true, // true for 465, false for other ports
                    service: 'gmail',
                    auth: {
                        user: this.sender,
                        pass: this.password,
                    },
                    tls: { rejectUnauthorized: false },
                });

                this.transporter.on('token', (token) => {
                    console.log('A new access token was generated');
                    console.log('User: %s', token.user);
                    console.log('Access Token: %s', token.accessToken);
                    console.log('Expires: %s', new Date(token.expires));
                });

                this.transporter.set(
                    'oauth2_provision_cb',
                    (_user, _renew, callback) => {
                        if (!this.transporter)
                            throw new Error(
                                'Gmail transporter not initialized for oauth2_provision_cb..'
                            );
                        const accessToken =
                            this.transporter.get('oauth2').accessToken;
                        if (!accessToken) {
                            return callback(new Error('Unknown user'));
                        } else {
                            return callback(null, accessToken);
                        }
                    }
                );
                this.transporter.set(
                    'oauth2_provision_cb_error',
                    (err: any) => {
                        console.log('Error refreshing access token: ', err);
                    }
                );

                resolve(true);
            } catch (err) {
                reject(err);
                logger.error(
                    'Error while initializing gmail transporter.',
                    err
                );
            }
        });
    }
}
