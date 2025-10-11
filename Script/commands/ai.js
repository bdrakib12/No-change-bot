module.exports.config = {
  name: "bot",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "CYBER ☢️ TEAM",
  description: "Auto reply when someone says 'bot'",
  commandCategory: "fun",
  usages: "",
  cooldowns: 3,
};

module.exports.run = async function({ api, event }) {
  // যখন কেউ 'bot' লিখবে তখন এই মেসেজ পাঠাবে 👇
  return api.sendMessage(
    "‎সুন্দর মাইয়া মানেই-🥱আমার বস hoon' এর বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸 @hoon",
    event.threadID,
    event.messageID
  );
};
