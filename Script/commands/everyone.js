module.exports.config = {
  name: "everyone",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️ BOT TEAM",
  description: "Mention everyone in the group with optional custom message",
  commandCategory: "group",
  usages: ".everyone <message>",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const mentions = threadInfo.participantIDs.map(id => ({ id, tag: "@everyone" }));

    // Custom message or default
    const customMsg = args.join(" ").trim() || "@everyone সবাই মনোযোগ দাও! 😎";

    return api.sendMessage({
      body: customMsg,
      mentions
    }, threadID);
    
  } catch (err) {
    return api.sendMessage("⚠️ গ্রুপের মেম্বারদের তথ্য আনা যায়নি।", threadID);
  }
};
