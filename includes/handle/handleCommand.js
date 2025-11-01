const moment = require("moment-timezone");
const logger = require("../../utils/log.js");

module.exports = async function ({ api, event, args, client, Users, Threads, Currencies }) {
  try {
    const { senderID, threadID, messageID, body } = event;
    const { commands } = client;
    const prefix = global.config.PREFIX || "!";

    // সময় ফরম্যাট ঠিক করা (MM নয়, mm)
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

    // বটের নাম
    const botName = global.config.BOTNAME || "MyBot";

    // কমান্ড নাম বের করা
    if (!body || !body.startsWith(prefix)) return;
    const content = body.slice(prefix.length).trim().split(/ +/);
    const commandName = content.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    // Thread Info Cache
    const threadInfo = client.threadInfo || new Map();
    const threadData = threadInfo.get(threadID) || await Threads.getInfo(threadID);

    // User Info Cache
    const userData = await Users.getData(senderID);

    // Cooldown সিস্টেম
    if (!client.cooldowns) client.cooldowns = new Map();
    if (!client.cooldowns.has(commandName))
      client.cooldowns.set(commandName, new Map());

    const timestamps = client.cooldowns.get(commandName);
    const cooldownAmount = (command.config.cooldowns || 3) * 1000;
    const now = Date.now();

    if (timestamps.has(senderID)) {
      const expiration = timestamps.get(senderID) + cooldownAmount;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        return api.sendMessage(
          `⏳ অনুগ্রহ করে ${remaining} সেকেন্ড অপেক্ষা করুন ${commandName} কমান্ডটি আবার ব্যবহার করার আগে।`,
          threadID,
          messageID
        );
      }
    }

    timestamps.set(senderID, now);
    setTimeout(() => timestamps.delete(senderID), cooldownAmount);

    // Permission চেক
    if (command.config.hasPermssion && command.config.hasPermssion > 0) {
      const threadInfo = await Threads.getInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(u => u.id);
      if (!adminIDs.includes(senderID)) {
        return api.sendMessage("⚠️ এই কমান্ডটি ব্যবহারের অনুমতি আপনার নেই।", threadID, messageID);
      }
    }

    // Command Run
    await command.run({
      api, event, args, client, Users, Threads, Currencies,
      threadID, senderID, messageID,
      time, userData, threadData,
    });

    logger(`✅ ${commandName} রান হয়েছে ${threadID} এ ${time} সময়ে`, "COMMAND");

  } catch (err) {
    const { threadID } = event;
    logger(`❌ Command Error: ${err.message || err}`, "ERROR");
    api.sendMessage(
      `❌ কমান্ড চালাতে সমস্যা হয়েছে:\n${err.message || err}`,
      threadID || global.config.ADMINBOT
    );
  }
};
