module.exports.config = {
  name: "everyone",
  version: "1.2.0",
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
    // গ্রুপের সব মেম্বার আইডি নিয়ে mentions তৈরি করা
    const threadInfo = await api.getThreadInfo(threadID);
    const mentions = threadInfo.participantIDs.map(id => ({ id, tag: "@everyone" }));

    // custom message
    const extraMsg = args.join(" ").trim();
    const messageBody = extraMsg ? `@everyone ${extraMsg}` : "@everyone সবাই মনোযোগ দাও! 😎";

    // মেসেজ পাঠানো
    return api.sendMessage({
      body: messageBody,
      mentions // সব মেম্বার এখানে mention হবে
    }, threadID);

  } catch (err) {
    return api.sendMessage("⚠️ গ্রুপের মেম্বারদের তথ্য আনা যায়নি।", threadID);
  }
};
