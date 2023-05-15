import { accessEnv } from '../utils/accessEnv';

export const enum Environment {
    API_PORT = 'API_PORT',
    BOT_PORT = 'BOT_PORT',
    NODE_ENV = 'NODE_ENV',
    SLEEP_TIME_SECONDS = 'SLEEP_TIME_SECONDS',
    SENDER_EMAIL = 'SENDER_EMAIL',
    SENDER_PASSWORD = 'SENDER_PASSWORD',
    RECEIVER_EMAILS = 'RECEIVER_EMAILS',
}

export const PROD =
    accessEnv(Environment.NODE_ENV, 'development') === 'production';
