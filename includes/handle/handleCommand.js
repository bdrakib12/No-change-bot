module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const stringSimilarity = require('string-similarity');
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const logger = require("../../utils/log.js");
    const axios = require('axios');
    const moment = require("moment-timezone");

    return async function ({ event }) {
        const dateNow = Date.now();
        const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
        const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode } = global.config;
        const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
        const { commands, cooldowns } = global.client;

        let { body, senderID, threadID, messageID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        const threadSetting = threadData.get(threadID) || {};
        const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(threadSetting.PREFIX || PREFIX)})\\s*`);
        if (!prefixRegex.test(body)) return;

        const matchedPrefix = body.match(prefixRegex)[0];
        const args = body.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        let command = commands.get(commandName);

        // Fuzzy match if command not found
        if (!command) {
            const allCommandName = [...commands.keys()];
            const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
            if (checker.bestMatch.rating >= 0.5) command = commands.get(checker.bestMatch.target);
            else return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID);
        }

        // Permission & bans
        if (userBanned.has(senderID) || threadBanned.has(threadID)) return;
        const perm = ADMINBOT.includes(senderID) ? 3 : NDH.includes(senderID) ? 2 : threadInfo.get(threadID)?.adminIDs?.some(ad => ad.id == senderID) ? 1 : 0;
        if (command.config.hasPermssion > perm) return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), threadID, messageID);

        // Cooldown
        if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Map());
        const timestamps = cooldowns.get(command.config.name);
        const expirationTime = (command.config.cooldowns || 1) * 1000;
        if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) {
            const waitTime = ((timestamps.get(senderID) + expirationTime - dateNow) / 1000).toFixed(2);
            return api.sendMessage(`You just used this command, try again after ${waitTime}s`, threadID, messageID);
        }

        // Language handler
        const getText = (...values) => {
            if (!command.languages?.[global.config.language]) return '';
            let text = command.languages[global.config.language][values[0]] || '';
            for (let i = 0; i < values.length; i++) text = text.replace(new RegExp(`%${i + 1}`, 'g'), values[i]);
            return text;
        };

        try {
            await command.run({ api, event, args, models, Users, Threads, Currencies, permssion: perm, getText });
            timestamps.set(senderID, dateNow);
            if (DeveloperMode) logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), Date.now() - dateNow), "[ DEV MODE ]");
        } catch (e) {
            return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
        }
    };
};
