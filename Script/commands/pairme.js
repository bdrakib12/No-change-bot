const fs = require("fs");

module.exports.config = {
  name: "pairme",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝐀𝑴_ ☢️",
  description: "Pair yourself with a mentioned or replied user 💞",
  commandCategory: "Fun",
  usages: "[tag someone or reply]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  // Sender info
  let senderName = await Users.getNameUser(senderID);

  // Determine target
  let targetID = null;
  let targetName = "";

  if (messageReply && messageReply.senderID !== senderID) {
    targetID = messageReply.senderID;
    targetName = await Users.getNameUser(targetID);
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID];
  } else {
    // Random target
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs.filter(id => id !== senderID);
    if (members.length === 0) return api.sendMessage("😅 এখানে pairing করার মতো কেউ নাই!", threadID, messageID);
    targetID = members[Math.floor(Math.random() * members.length)];
    targetName = await Users.getNameUser(targetID);
  }

  // Random compatibility %
  const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
  const matchRate = percentages[Math.floor(Math.random() * percentages.length)];

  // Image (আপনি চাইলে অন্য URL দিতে পারেন)
  const imgURL = "https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png";

  const msg = {
    body: `💞 𝐏𝐀𝐈𝐑 𝐌𝐀𝐓𝐂𝐇 💞\n━━━━━━━━━━━━━━\n🥰 ${senderName} ❤️ ${targetName}\n💌 Compatibility Score: ${matchRate}\n━━━━━━━━━━━━━━\n✨ একসাথে থাকো সুখে 💫`,
    attachment: await global.utils.getStreamFromURL(imgURL),
    mentions: [
      { tag: senderName, id: senderID },
      { tag: targetName, id: targetID }
    ],
  };

  return api.sendMessage(msg, threadID, messageID);
};
