const axios = require("axios");

// Rubish base
const RUBISH_BASE = "https://rubish.online/rubish";
const RUBISH_APIKEY = "rubish69";
const RUBISH_FONT = 0;

module.exports.config = {
  name: "baby",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "hoon",
  description: "Baby bot (full Rubish) — chat / teach / list",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

function buildRubishUrl(params = {}) {
  const url = new URL(`${RUBISH_BASE}/simma`);
  // always include apikey and font
  url.searchParams.append("apikey", RUBISH_APIKEY);
  url.searchParams.append("font", String(RUBISH_FONT));
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      url.searchParams.append(k, v);
    }
  }
  return url.toString();
}

// Normalize response(s) — prioritize res.data.reply (rubish), fallback to other fields
function normalizeResponsesFromResData(data) {
  if (!data) return ["নো রেসপন্স (empty)"];

  // direct reply field (rubish style)
  if (typeof data.reply === "string" && data.reply.trim() !== "") {
    return [data.reply];
  }

  const candidate =
    data.response !== undefined ? data.response : data;
  const arr = Array.isArray(candidate) ? candidate : [candidate];

  const mapped = arr
    .map(item => {
      if (item === null || item === undefined) return "";
      if (typeof item === "string") return item;
      if (typeof item === "object") {
        if (typeof item.reply === "string" && item.reply.trim() !== "")
          return item.reply;
        if (typeof item.message === "string" && item.message.trim() !== "")
          return item.message;
        if (typeof item.text === "string" && item.text.trim() !== "")
          return item.text;
        if (typeof item.msg === "string" && item.msg.trim() !== "")
          return item.msg;
        if (typeof item.output === "string" && item.output.trim() !== "")
          return item.output;
        try {
          return JSON.stringify(item);
        } catch (e) {
          return String(item);
        }
      }
      return String(item);
    })
    .filter(s => s !== undefined && s !== null && s !== "");

  return mapped.length ? mapped : ["নো রেসপন্স (normalized empty)"];
}

async function callRubish(params = {}) {
  const url = buildRubishUrl(params);
  const res = await axios.get(url);
  // debug log (চাইলে পরে মুছে দিতে পারো)
  console.log("RUBISH CALL:", url);
  console.log("RUBISH RES:", JSON.stringify(res.data, null, 2));
  return res.data;
}

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const rawQuery = args.join(" ").trim();
    const query = rawQuery.toLowerCase();

    // no query -> small random prompt
    if (!query) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "rubish"
          });
        }
      });
    }

    const command = args[0].toLowerCase();

    // ===== TEACH =====
    if (command === "teach") {
      const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
      if (parts.length < 2) {
        return api.sendMessage(
          " | Use: teach [Question] - [Reply]",
          event.threadID,
          event.messageID
        );
      }

      const [ask, ans] = parts.map(p => p.trim());
      const params = { teach: ask, reply: ans, senderID: uid, senderName };
      const data = await callRubish(params);

      const out =
        (data && data.message) ||
        (data && data.reply) ||
        JSON.stringify(data);
      return api.sendMessage(String(out), event.threadID, event.messageID);
    }

    // ===== LIST =====
    if (command === "list") {
      const data = await callRubish({ list: "all" });

      if (Array.isArray(data)) {
        return api.sendMessage(data.join("\n\n"), event.threadID, event.messageID);
      } else if (data && typeof data === "object") {
        const out = JSON.stringify(data, null, 2);
        return api.sendMessage(
          out.length > 1500 ? out.slice(0, 1400) + " ... (truncated)" : out,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(String(data), event.threadID, event.messageID);
      }
    }

    // ===== EDIT (pseudo-edit: remove + teach করা যায় চাইলে, আপাতত সরাসরি API কলে রাখা) =====
    if (command === "edit") {
      const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
      if (parts.length < 3) {
        return api.sendMessage(
          " | Use: edit [Question] - [OldReply] - [NewReply]",
          event.threadID,
          event.messageID
        );
      }

      const [ask, oldReply, newReply] = parts.map(p => p.trim());
      const data = await callRubish({
        edit: ask,
        old: oldReply,
        new: newReply,
        senderID: uid,
        senderName
      });
      return api.sendMessage(JSON.stringify(data), event.threadID, event.messageID);
    }

    // ===== REMOVE (best-effort) =====
    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
      if (parts.length < 2) {
        return api.sendMessage(
          " | Use: remove [Question] - [Reply]",
          event.threadID,
          event.messageID
        );
      }
      const [ask, ans] = parts.map(p => p.trim());

      // primary: delete param
      let data = await callRubish({
        delete: ask,
        reply: ans,
        senderID: uid,
        senderName
      });

      // যদি error থাকে, alternative remove param try করা
      if (data && data.error) {
        data = await callRubish({
          remove: ask,
          reply: ans,
          senderID: uid,
          senderName
        });
      }

      return api.sendMessage(JSON.stringify(data), event.threadID, event.messageID);
    }

    // ===== DEFAULT: CHAT =====
    const rubData = await callRubish({
      text: rawQuery,
      senderID: uid,
      senderName
    });

    const replies = normalizeResponsesFromResData(rubData);
    for (const reply of replies) {
      await new Promise(resolve => {
        api.sendMessage(String(reply), event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "rubish"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error("BABY (rubish) ERROR:", err);
    return api.sendMessage(
      `| Error in baby (rubish): ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
};

// ✅ bump problem fix: শুধু যার author == handleReply.author তার reply তে উত্তর
module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  try {
    // অন্য কেউ reply করলে ignore
    if (event.senderID !== handleReply.author) return;

    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.trim() : "";
    if (!replyText) return;

    const rubData = await callRubish({
      text: replyText,
      senderID: event.senderID,
      senderName
    });

    const replies = normalizeResponsesFromResData(rubData);
    for (const reply of replies) {
      await new Promise(resolve => {
        api.sendMessage(String(reply), event.threadID, (err, info) => {
          if (!err) {
            // আবারও একই লোককে author হিসাবে সেট করছি
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "rubish"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error("HANDLE REPLY (rubish) ERROR:", err);
    return api.sendMessage(
      ` | Error in handleReply: ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;

    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;

    // direct keyword ping
    if (
      raw === "baby" ||
      raw === "bot" ||
      raw === "bby" ||
      raw === "jan" ||
      raw === "xan" ||
      raw === "জান" ||
      raw === "বট" ||
      raw === "বেবি"
    ) {
      const greetings = [
        "Bolo baby 💬",
        "হুম? বলো 😺",
        "হ্যাঁ জানু 😚",
        "শুনছি বেবি 😘"
      ];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];

      const mention = {
        body: `${randomReply} @${senderName}`,
        mentions: [{ tag: `@${senderName}`, id: senderID }]
      };

      return api.sendMessage(mention, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "rubish"
          });
        }
      }, event.messageID);
    }

    // prefix chat: "baby ..." / "bot ..." / "bby ..." / "jan ..."
    if (
      raw.startsWith("baby ") ||
      raw.startsWith("bot ") ||
      raw.startsWith("bby ") ||
      raw.startsWith("jan ")
    ) {
      const query = raw
        .replace(/^baby\s+|^bot\s+|^bby\s+|^jan\s+/i, "")
        .trim();
      if (!query) return;

      const rubData = await callRubish({
        text: query,
        senderID,
        senderName
      });

      const replies = normalizeResponsesFromResData(rubData);
      for (const reply of replies) {
        await new Promise(resolve => {
          api.sendMessage(String(reply), event.threadID, (err, info) => {
            if (!err) {
              global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "rubish"
              });
            }
            resolve();
          }, event.messageID);
        });
      }
    }
  } catch (err) {
    console.error("HANDLE EVENT (rubish) ERROR:", err);
    return api.sendMessage(
      `| Error in handleEvent: ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
};
