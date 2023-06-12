import { Environment } from '../constants/environments';
import { GmailTransporter } from '../models/MailTransporter';
import { accessEnv } from './accessEnv';

export const getGmailTransporter = async () => {
    const sender = accessEnv(Environment.SENDER_EMAIL, 'sender@email.com');
    const password = accessEnv(Environment.SENDER_PASSWORD, 'password');
    const receivers = accessEnv(
        Environment.RECEIVER_EMAILS,
        'receiver1@email.com,receiver2@email.com'
    ).split(',');

    return await new GmailTransporter(sender, password, receivers);
};

export const setDifference = <T>(setA: T[], setB: T[]): T[] => {
    return setA.filter(
        (itemA) => !setB.some((itemB) => (itemA as any).equals(itemB))
    );
};
