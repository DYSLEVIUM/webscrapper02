import {
    AttachmentBuilder,
    Client,
    Events,
    GatewayIntentBits,
    TextChannel,
} from 'discord.js';
import { hostname } from 'os';
import { Environment } from '../constants/environments';
import { accessEnv } from '../utils/accessEnv';
import { logger } from '../utils/logger';

const connectDiscordClient = () => {
    const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

    discordClient.once(Events.ClientReady, (c) => {
        logger.info(`Discord Bot is ready and logged in as ${c.user.tag}.`);
        const guilds = discordClient.guilds.cache.map((guild) => guild.id);
        const channels = discordClient.channels.cache.map(
            (channel) => channel.id
        );

        const channel = c.channels.cache.get('1124008290674802718');
        if (!channel) return;

        (channel as TextChannel).send(hostname());

        console.log(discordClient.channels.cache);

        // discordClient.channels.cache.map((channel) => {
        //     if(typeof channel === TextChannel) {

        //     }
        //     if (channel.name === 'general') {
        //         console.log(channel.id);
        //     }
        // });
    });

    // Log in to Discord with your discordClient's token
    discordClient.login(accessEnv(Environment.DISCORD_TOKEN, 'DISCORD_TOKEN'));

    const channel = discordClient.channels.cache.get('id');
    // console.log(discordClient.guilds);
};

export class DiscordTransporter {
    private static discordClient: Client = new Client({
        intents: [GatewayIntentBits.Guilds],
    });

    static async init() {
        await new Promise(async (resolve) => {
            this.discordClient.once(Events.ClientReady, (c) => {
                logger.info(
                    `Discord Bot is ready and logged in as ${c.user.tag}.`
                );
            });

            resolve(
                await this.discordClient.login(
                    accessEnv(Environment.DISCORD_TOKEN, 'DISCORD_TOKEN')
                )
            );
        });
    }

    static send(message: string, attachmentPaths: string[]) {
        const channels = this.discordClient.channels.cache;

        for (let [_, channel] of channels) {
            if (channel.type !== 0) continue;
            channel.send({
                files: attachmentPaths.map(
                    (attachmentPath) => new AttachmentBuilder(attachmentPath)
                ),
            });
            return;
        }

        channels.forEach((channel) => {
            if (channel.type !== 0) return;

            channel.send({
                files: attachmentPaths.map(
                    (attachmentPath) => new AttachmentBuilder(attachmentPath)
                ),
                content: message,
            });
        });

        logger.info(`Sent message to all text channels.`);
    }
}
