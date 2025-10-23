module.exports.config = {
  name: "tags",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️ BOT TEAM",
  description: "Smart everyone & reply mention with default messages",
  commandCategory: "group",
  usages: ".everyone <message> OR reply + .mention <message>",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;

  // =========================
  // 1️⃣ .everyone ফিচার
  // =========================
  if (args[0] && args[0].toLowerCase() === "everyone") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const mentions = threadInfo.participantIDs.map(id => ({ id, tag: "@everyone" }));

      // custom message or default
      const customMsg = args.slice(1).join(" ").trim() || "@everyone সবাই মনোযোগ দাও! 😎";

      return api.sendMessage({
        body: customMsg,
        mentions
      }, threadID);
    } catch (err) {
      return api.sendMessage("⚠️ গ্রুপের মেম্বারদের তথ্য আনা যায়নি।", threadID);
    }
  }

  // =========================
  // 2️⃣ .mention ফিচার
  // =========================
  if (args[0] && args[0].toLowerCase() === "mention") {
    // reply না থাকলে warning
    if (event.type !== "message_reply") {
      return api.sendMessage("⚠️ এই কমান্ড ব্যবহার করতে কারো মেসেজে reply দাও এবং তারপর .mention টাইপ করো।", threadID);
    }

    const mentionID = event.messageReply.senderID;
    try {
      const userInfo = await api.getUserInfo(mentionID);
      const mentionName = userInfo[mentionID].name;

      const customMsg = args.slice(1).join(" ").trim() || "";

      return api.sendMessage({
        body: `@${mentionName} ${customMsg}`.trim(),
        mentions: [{
          id: mentionID,
          tag: `@${mentionName}`
        }]
      }, threadID, event.messageID);
    } catch (err) {
      return api.sendMessage("⚠️ ইউজারের তথ্য পাওয়া যায়নি।", threadID);
    }
  }

  // =========================
  // যদি কোন ফিচার না মিললে
  // =========================
  return api.sendMessage(
    "⚠️ ব্যবহার: \n.everyone <message> OR reply + .mention <message>",
    threadID
  );
};
