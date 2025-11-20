const axios = require("axios");

// === CONFIG: two API bases ===
// Rubish for normal conversation (simma)
const RUBISH_BASE = "https://rubish.online/rubish";
const RUBISH_APIKEY = "rubish69";
const RUBISH_FONT = 0;

// Old Simsimi service for teach/edit/remove/list
const SIMSIM_BASE = "https://simsimi.cyberbot.top";

module.exports.config = {
  name: "baby",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "hoon",
  description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

function buildRubishUrl(path = "/simma", params = {}) {
  const url = new URL(`${RUBISH_BASE}${path}`);
  // default params for rubish
  url.searchParams.append("apikey", RUBISH_APIKEY);
  url.searchParams.append("font", String(RUBISH_FONT));
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  }
  return url.toString();
}

function buildSimsimUrl(path = "/simsimi", params = {}) {
  const url = new URL(`${SIMSIM_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  }
  return url.toString();
}

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const rawQuery = args.join(" ").trim();
    const query = rawQuery.toLowerCase();

    // No query: send random prompt (same as before)
    if (!query) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      });
    }

    const command = args[0].toLowerCase();

    // ===== remove (use old simsimi service) =====
    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage(" | Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts.map(p => p.trim());
      const url = buildSimsimUrl("/delete", { ask: ask, ans: ans, senderID: uid, senderName });
      const res = await axios.get(url);
      return api.sendMessage(res.data.message || JSON.stringify(res.data), event.threadID, event.messageID);
    }

    // ===== list (use old simsimi service) =====
    if (command === "list") {
      const url = buildSimsimUrl("/list");
      const res = await axios.get(url);
      if (res.data && res.data.code === 200) {
        return api.sendMessage(
          `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\n☠︎︎ Developer: ${res.data.author}`,
          event.threadID, event.messageID
        );
      } else {
        return api.sendMessage(`Error: ${res.data.message || "Failed to fetch list"}`, event.threadID, event.messageID);
      }
    }

    // ===== edit (use old simsimi service) =====
    if (command === "edit") {
      const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
      if (parts.length < 3)
        return api.sendMessage(" | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
      const [ask, oldReply, newReply] = parts.map(p => p.trim());
      const url = buildSimsimUrl("/edit", { ask: ask, old: oldReply, new: newReply, senderID: uid, senderName });
      const res = await axios.get(url);
      return api.sendMessage(res.data.message || JSON.stringify(res.data), event.threadID, event.messageID);
    }

    // ===== teach (use old simsimi service) =====
    if (command === "teach") {
      const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage(" | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

      const [ask, ans] = parts.map(p => p.trim());
      const groupID = event.threadID;
      let groupName = event.threadName ? event.threadName.trim() : "";

      if (!groupName && groupID != uid) {
        try {
          const threadInfo = await api.getThreadInfo(groupID);
          if (threadInfo && threadInfo.threadName) groupName = threadInfo.threadName.trim();
        } catch (error) {
          console.error(`Error fetching thread info for ID ${groupID}:`, error);
        }
      }

      const params = { ask, ans, senderID: uid, senderName, groupID };
      if (groupName) params.groupName = groupName;

      const url = buildSimsimUrl("/teach", params);
      const res = await axios.get(url);
      return api.sendMessage(`${res.data.message || "Reply added successfully!"}`, event.threadID, event.messageID);
    }

    // ===== Default conversation: use Rubish simma (Rubish is primary for chat) =====
    const simmaUrl = buildRubishUrl("/simma", { text: rawQuery, senderID: uid, senderName });
    const res = await axios.get(simmaUrl);

    // Normalize responses (support both array and single)
    const responses = Array.isArray(res.data.response) ? res.data.response : (res.data.response ? [res.data.response] : [String(res.data)]);

    for (const reply of responses) {
      await new Promise((resolve) => {
        api.sendMessage(String(reply), event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in baby command: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  try {
    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.trim() : "";
    if (!replyText) return;

    // When replying in-thread: use Rubish simma for conversational replies
    const url = buildRubishUrl("/simma", { text: replyText, senderID: event.senderID, senderName });
    const res = await axios.get(url);

    const responses = Array.isArray(res.data.response) ? res.data.response : (res.data.response ? [res.data.response] : [String(res.data)]);

    for (const reply of responses) {
      await new Promise((resolve) => {
        api.sendMessage(String(reply), event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(` | Error in handleReply: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;
    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;

    // direct keyword pings -> reply with random greetings (unchanged)
    if (
      raw === "baby" || raw === "bot" || raw === "bby" ||
      raw === "jan" || raw === "xan" || raw === "জান" || raw === "বট" || raw === "বেবি"
    ) {
      const greetings = [
        "Bolo baby 💬", "হুম? বলো 😺", "হ্যাঁ জানু 😚", "শুনছি বেবি 😘", "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈", "Boss বল boss😼",
        "আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘", "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣", "jang hanga korba😒😬",
        "আমাকে না ডেকে আমার বস **hoon** কে একটা জি এফ দাও-😽🫶🌺", "মাইয়া হলে চিপায় আসো 🙈😘", "হুদাই গ্রুপে আছি-🥺🐸"
      ];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];

      const mention = {
        body: `${randomReply} @${senderName}`,
        mentions: [{
          tag: `@${senderName}`,
          id: senderID
        }]
      };

      return api.sendMessage(mention, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    }

    // prefix-based chat triggers (e.g., "baby ...") -> forward the question to Rubish simma
    if (
      raw.startsWith("baby ") || raw.startsWith("bot ") || raw.startsWith("bby ") ||
      raw.startsWith("jan ") || raw.startsWith("xan ") ||
      raw.startsWith("জান ") || raw.startsWith("বট ") || raw.startsWith("বেবি ")
    ) {
      const query = raw.replace(/^baby\s+|^bot\s+|^bby\s+|^jan\s+|^xan\s+|^জান\s+|^বট\s+|^বেবি\s+/i, "").trim();
      if (!query) return;

      const simmaUrl = buildRubishUrl("/simma", { text: query, senderID, senderName });
      const res = await axios.get(simmaUrl);
      const responses = Array.isArray(res.data.response) ? res.data.response : (res.data.response ? [res.data.response] : [String(res.data)]);

      for (const reply of responses) {
        await new Promise((resolve) => {
          api.sendMessage(String(reply), event.threadID, (err, info) => {
            if (!err) {
              global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "simsimi"
              });
            }
            resolve();
          }, event.messageID);
        });
      }
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in handleEvent: ${err.message}`, event.threadID, event.messageID);
  }
};
