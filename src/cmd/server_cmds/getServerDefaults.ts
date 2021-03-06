import { Server } from './../../models/server';
import { DiscordClientWrapper } from './../../DiscordClientWrapper';
import * as Discord from 'discord.js';
import { SqlServerService as sqlServerService } from '../../services/sql.service';
import { Command, CommandConfiguration, CommandHelp } from '../../models/command';


export class GetServerDefaults extends Command {

    conf: CommandConfiguration = {
        enabled: true,
        guildOnly: true,
        aliases: [],
        permLevel: 0
    };

    help: CommandHelp = {
        name: 'getServerDefaults',
        description: 'Get the server defaults for pubg commands.',
        usage: '<prefix>getServerDefaults',
        examples: [
            '!pubg-getServerDefaults'
        ]
    };

    async run(bot: DiscordClientWrapper, msg: Discord.Message, params: string[], perms: number) {
        msg.channel.send('Getting server defaults ...')
            .then(async (message: Discord.Message) => {
                let server: Server = await sqlServerService.getServerDefaults(msg.guild.id);
                let embed: Discord.RichEmbed = new Discord.RichEmbed()
                    .setTitle('Server Defaults')
                    .setDescription('The defaults that a server has when running PUBG Bot commands.')
                    .setColor(0x00AE86)
                    .addField('Bot Prefix', server.default_bot_prefix, true)
                    .addBlankField(true)
                    .addBlankField(true)
                    .addBlankField(false)
                    .addField('Default Season', server.default_season, true)
                    .addField('Default Region', server.default_region, true)
                    .addField('Default Mode', server.default_mode, true)
                    .addField('Default Squad Size', server.default_squadSize, true);
                message.edit({ embed });
            });
    };

}
