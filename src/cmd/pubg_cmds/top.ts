import * as Discord from 'discord.js';
import { CommonService as cs } from '../../services/common.service';
import { PubgService as pubgService } from '../../services/pubg.service';
import {
    SqlServerService as sqlServerService,
    SqlSeasonsService as sqlSeasonsService,
    SqlRegionsService as sqlRegionsService,
    SqlModesService as sqlModesService,
    SqlServerRegisteryService as sqlServerRegisteryService,
    SqlSqaudSizeService as sqlSqaudSizeService
} from '../../services/sql.service';
import { Player } from '../../models/player';
import { Command, CommandConfiguration, CommandHelp } from '../../models/command';
import { Seasons as SeasonEnum } from '../../enums/season.enum';
import { SquadSize as SquadSizeEnum } from '../../enums/squadSize.enum';
import { Server } from '../../models/server';


export class Top extends Command {

    conf: CommandConfiguration = {
        enabled: true,
        guildOnly: true,
        aliases: [],
        permLevel: 0
    };

    help: CommandHelp = {
        name: 'top',
        description: 'Tableau des  "x" joueurs enregister les mieux classés sur le serveur',
        usage: '',
        examples: [
            '!-top 5',
            '!-top season=2018-03',
            '!-top season=2018-03 region=eu',
            '!-top season=2018-03 region=eu squadSize=4',
            '!-top season=2018-03 region=eua squadSize=4 mode=fpp',
            '!-top 5 season=2018-03',
            '!-top 5 season=2018-03 region=eu',
            '!-top 5 season=2018-03 region=eu squadSize=4',
            '!-top 5 season=2018-03 region=eu squadSize=4 mode=fpp'
        ]
    };

    async run(bot: any, msg: any, params: string[], perms: number) {
        let amount: number = 10;
        if (params[0] && !isNaN(+params[0])) {
            amount = +params[0];
        }
        let serverDefaults: Server = await sqlServerService.getServerDefaults(msg.guild.id);
        let season: string = cs.getParamValue('season=', params, serverDefaults.default_season);
        let region: string = cs.getParamValue('region=', params, serverDefaults.default_region);
        let mode: string = cs.getParamValue('mode=', params, serverDefaults.default_mode);
        let squadSize: string = cs.getParamValue('squadSize=', params, serverDefaults.default_squadSize);
        let checkingParametersMsg: Discord.Message = (await msg.channel.send('Checking for valid parameters ...')) as Discord.Message;

        if (!(await this.checkParameters(msg, season, region, mode, squadSize))) {
            checkingParametersMsg.delete();
            return;
        }
        let registeredPlayers: Player[] = await sqlServerRegisteryService.getRegisteredPlayersForServer(msg.guild.id);
        if (registeredPlayers.length === 0) {
            cs.handleError(msg, 'Érreur:: Aucun joueur ajouté. Utilise `addUser` commande', this.help);
            return;
        }

        const batchEditAmount: number = 5;
        checkingParametersMsg.edit(`Agrégation du \`top ${amount}\` sur les \`${registeredPlayers.length} jouers enregistrés\` ... une seconde ...`);
        msg.channel.send('Extraction des informations sur le joueur')
            .then(async (msg: Discord.Message) => {
                let playersInfo: Player[] = new Array();
                for (let i = 0; i < registeredPlayers.length; i++) {
                    let player: Player = registeredPlayers[i];
                    if (i % batchEditAmount === 0) {
                        let max: number = (i + batchEditAmount) > registeredPlayers.length ? registeredPlayers.length : i + batchEditAmount;
                        msg.edit(`Récolte des infos Joeur ${i + 1} - ${max}`);
                    }
                    let id: string = await pubgService.getCharacterID(player.username, region);
                    let characterInfo: Player = await pubgService.getPUBGCharacterData(id, player.username, season, region, +squadSize, mode);
                    // Check if character info exists for this (it wont if a user hasn't played yet)
                    if (!characterInfo) {
                        characterInfo = {
                            id: '',
                            pubg_id: id,
                            username: player.username,
                            rank: '',
                            rating: '',
                            grade: '',
                            headshot_kills: '',
                            longest_kill: '',
                            topPercent: '',
                            winPercent: '',
                            topTenPercent: '',
                            kda: '0.00',
                            kd: '0.00',
                            average_damage_dealt: '0.00',
                        };
                    }
                    playersInfo.push(characterInfo);
                }
                // Sorting Array based off of ranking (higher ranking is better)
                playersInfo.sort(function (a: Player, b: Player) { return (+b.rating) - (+a.rating); });
                let topPlayers: Player[] = playersInfo.slice(0, amount);
                let embed: Discord.RichEmbed = new Discord.RichEmbed()
                    .setTitle('Top ' + amount + ' des meilleurs jouers du serveur ')
                    .setDescription('Saison:\t' + SeasonEnum[season] + '\nRégion:\t' + region.toUpperCase() + '\nMode de vue: \t' + mode.toUpperCase() + '\nTaille équipe: \t' + SquadSizeEnum[squadSize])
                    .setColor(0x00AE86)
                    .setFooter('Data 📥 de: `https://pubg.op.gg`')
                    .setTimestamp();
                let names: string = '';
                let ratings: string = '';
                let kds: string = '';
                // Construct top strings
                for (var i = 0; i < topPlayers.length; i++) {
                    let character: Player = topPlayers[i];
                    let ratingStr: string = character.rating ? `${character.rank} / ${character.rating}` : 'Non disponible';
                    let kdsStr: string = `${character.kd} / ${character.kda} / ${character.average_damage_dealt}`;
                    names += character.username + '\n';
                    ratings += ratingStr + '\n';
                    kds += kdsStr + '\n';
                }
                embed.addField('Pseudo Joeur',names , false)
                    .addField('#Place / Point de Rating', ratings, true)
                    .addField('KD / KDA / Avg Dmg', kds, true);
                await msg.edit({ embed });
            });
    };

    async checkParameters(msg: Discord.Message, checkSeason: string, checkRegion: string, checkMode: string, checkSquadSize: string): Promise<boolean> {
        let errMessage: string = '';
        let validSeason: boolean = await pubgService.isValidSeason(checkSeason);
        let validRegion: boolean = await pubgService.isValidRegion(checkRegion);
        let validMode: boolean = await pubgService.isValidMode(checkMode);
        let validSquadSize: boolean = await pubgService.isValidSquadSize(checkSquadSize);
        if (!validSeason) {
            let seasons: any = await sqlSeasonsService.getAllSeasons();
            let availableSeasons = '== Available Seasons ==\n';
            for (let i = 0; i < seasons.length; i++) {
                if (i < seasons.length - 1) {
                    availableSeasons += seasons[i].season + ', ';
                }
                else {
                    availableSeasons += seasons[i].season;
                }
            }
            errMessage += `Erreur:: Paramètre de la saison invalide\n${availableSeasons}\n`;
        }
        if (!validRegion) {
            let regions: any = await sqlRegionsService.getAllRegions();
            let availableRegions: string = '== Available Regions ==\n';
            for (let i = 0; i < regions.length; i++) {
                if (i < regions.length - 1) {
                    availableRegions += regions[i].shortname + ', ';
                }
                else {
                    availableRegions += regions[i].shortname;
                }
            }
            errMessage += `\nErreur:: Paramètre de la region invalide\n${availableRegions}\n`;
        }
        if (!validMode) {
            let modes: any = await sqlModesService.getAllModes();
            let availableModes: string = '== Available Modes ==\n';
            for (let i = 0; i < modes.length; i++) {
                if (i < modes.length - 1) {
                    availableModes += modes[i].shortname + ', ';
                }
                else {
                    availableModes += modes[i].shortname;
                }
            }
            errMessage += `\nErreur:: Paramètre du mode de jeu invalide\n${availableModes}\n`;
        }
        if (!validSquadSize) {
            let squadSizes: any = await sqlSqaudSizeService.getAllSquadSizes();
            let availableSizes: string = '== Available Squad Sizes ==\n';
            for (let i = 0; i < squadSizes.length; i++) {
                if (i < squadSizes.length - 1) {
                    availableSizes += squadSizes[i].size + ', ';
                }
                else {
                    availableSizes += squadSizes[i].size;
                }
            }
            errMessage += `\nErreur:: Paramètre de la taille des équipes invalide\n${availableSizes}\n`;
        }
        if (!validSeason || !validRegion || !validMode || !validSquadSize) {
            cs.handleError(msg, errMessage, this.help);
            return false;
        }
        return true;
    }
}

