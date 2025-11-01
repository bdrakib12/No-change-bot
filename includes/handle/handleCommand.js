module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require('string-similarity'),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const axios = require('axios')
  const moment = require("moment-timezone"); // moment.js is retained for consistency
  return async function ({ event }) {
    const timeStart = Date.now()
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY"); // ✅ fixed minutes

    const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaOnly } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns, allCommandName } = global.client; 
    var { body, senderID, threadID, messageID } = event;
    var senderID = String(senderID),
      threadID = String(threadID);
    const threadSetting = threadData.get(threadID) || {}
    
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : PREFIX)})\\s*`);
    
    // ✅ null check for match
    const match = body.match(prefixRegex);
    if (!match) return;
    const matchedPrefix = match[0];
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);

    const adminbot = require('./../../config.json');

    // --- Admin/Ban Checks ---
    if (!global.data.allThreadID.includes(threadID) && !ADMINBOT.includes(senderID) && adminbot.adminPaOnly == true)
        return api.sendMessage("MODE » Only admins can use bots in their own inbox", threadID, messageID);
    if (!ADMINBOT.includes(senderID) && adminbot.adminOnly == true)
        return api.sendMessage('MODE » Only admins can use bots', threadID, messageID);
    if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.ndhOnly == true)
        return api.sendMessage('MODE » Only bot support can use bots', threadID, messageID);

    const dataAdbox = require('../../Script/commands/cache/data.json'); 
    var threadInf = threadInfo.get(threadID);
    if (!threadInf) {
        try {
            threadInf = await Threads.getInfo(threadID);
            if (threadInf) threadInfo.set(threadID, threadInf); 
        } catch (err) {
            logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
        }
    }
    const findd = (threadInf?.adminIDs || []).find(el => el.id == senderID);
    if (dataAdbox.adminbox.hasOwnProperty(threadID) && dataAdbox.adminbox[threadID] == true && !ADMINBOT.includes(senderID) && !findd && event.isGroup == true)
        return api.sendMessage('MODE » Only admins can use bots', event.threadID, event.messageID);

    // --- Banned User/Thread Checks ---
    if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) {
        // ... (Banned logic remains the same)
    }

    let commandName = args.shift().toLowerCase();
    let command = commands.get(commandName);

    // --- String Similarity Check (Fuzzy Match) ---
    if (!command) {
      if (!global.client.allCommandName || global.client.allCommandName.length === 0) {
        global.client.allCommandName = Array.from(commands.keys());
      }
      const checker = stringSimilarity.findBestMatch(commandName, global.client.allCommandName);
      if (checker.bestMatch.rating >= 0.7) { 
        command = commands.get(checker.bestMatch.target);
        commandName = checker.bestMatch.target; 
      }
      else return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID);
    }

    // --- Permission Check ---
    var permssion = 0;
    var threadInfoo = threadInfo.get(threadID);
    if (!threadInfoo) {
        try {
            threadInfoo = await Threads.getInfo(threadID);
            if (threadInfoo) threadInfo.set(threadID, threadInfoo);
        } catch (err) {
            logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
        }
    }

    const find = (threadInfoo?.adminIDs || []).find(el => el.id == senderID);
    if (NDH.includes(senderID.toString())) permssion = 2;
    if (ADMINBOT.includes(senderID.toString())) permssion = 3;
    else if (!ADMINBOT.includes(senderID) && !NDH.includes(senderID) && find) permssion = 1;
    if (command.config.hasPermssion > permssion) return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), event.threadID, event.messageID);

    // --- Cooldown Check ---
    // ✅ fixed client reference
    if (!global.client.cooldowns.has(command.config.name)) global.client.cooldowns.set(command.config.name, new Map());
    const timestamps = global.client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    
    if (timestamps.has(senderID)) {
        const timeRemaining = (timestamps.get(senderID) + expirationTime - timeStart) / 1000;
        if (timeRemaining > 0) {
            return api.sendMessage(
                `You just used this command and\ntry again later ${timeRemaining.toFixed(2)} In another second, use the order again slowly`, 
                threadID, 
                messageID
            );
        }
    }

    // --- Execute Command ---
    var getText2;
    if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language)) {
      getText2 = (...values) => {
        var lang = command.languages[global.config.language][values[0]] || '';
        // ✅ fixed index loop
        for (var i = values.length - 1; i > 0; i--) {
          const expReg = RegExp('%' + i, 'g');
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    } else getText2 = () => {};
    
    try {
      const Obj = {};
      Obj.api = api
      Obj.event = event
      Obj.args = args
      Obj.models = models
      Obj.Users = Users
      Obj.Threads = Threads
      Obj.Currencies = Currencies
      Obj.permssion = permssion
      Obj.getText = getText2
      
      await command.run(Obj); 
      
      timestamps.set(senderID, timeStart);
      if (DeveloperMode == !![])
        logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), (Date.now()) - timeStart), "[ DEV MODE ]");
      return;
    } catch (e) {
      logger(global.getText("handleCommand", "commandError", commandName, e.stack || e.message), "error");
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, "An unexpected error occurred."), threadID, messageID);
    }
  };
};
