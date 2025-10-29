const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "crush",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + GPT-5 Edit",
  description: "Crush generator 💞 | Random pair, mentioned user, or replied user",
  commandCategory: "fun",
  usages: "[tag] or reply",
  cooldowns: 5
};

// =======================
// 🩷 Main Run Function (updated to support reply)
// =======================
module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID, senderID } = event;
  try {
    // get mentions (if any)
    const mentionIDs = event.mentions ? Object.keys(event.mentions) : [];

    let userOne = senderID;
    let userTwo = null;

    // Priority: mention -> reply -> random
    if (mentionIDs.length > 0) {
      userTwo = mentionIDs[0];
    } else if (event.messageReply && event.messageReply.senderID) {
      // if the message is a reply, use the replied-to user's ID
      if (event.messageReply.senderID === senderID) {
        // replied to own message — fallback to random selection
        userTwo = null;
      } else {
        userTwo = event.messageReply.senderID;
      }
    }

    if (!userTwo) {
      // pick random participant from the thread (exclude sender and bot)
      const threadInfo = await api.getThreadInfo(threadID);
      let members = threadInfo.participantIDs || [];
      const botID = api.getCurrentUserID ? api.getCurrentUserID() : null;
      members = members.filter(id => id !== senderID && id !== botID);

      if (members.length === 0) {
        return api.sendMessage("এখানে আর কেউ নেই যাকে র‍্যান্ডম করে বেছে নেওয়া যাবে। ম্যানশন বা রিপ্লাই দিয়ে চেষ্টা করো।", threadID, messageID);
      }
      userTwo = members[Math.floor(Math.random() * members.length)];
    }

    // Create image (makeImage expects two IDs; adjust if your makeImage signature differs)
    const path = await makeImage(userOne, userTwo);

    await api.sendMessage({
      body: `💘 Crush Match Completed 💘\n\n${userOne === userTwo ? "এটি আপনার নিজের ছবির সাথে মিলানো হয়েছে।" : "এরা এখন ক্রাশ পার্টনার!"}`,
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      try { fs.unlinkSync(path); } catch (e) { /* ignore */ }
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("কিছু ভুল হয়েছে 😢 আবার চেষ্টা করো।", event.threadID, event.messageID);
  }
};

// =======================
// 🎨 Helper: Make Image
// (same as before — keep your existing implementation or replace with this)
// =======================
async function makeImage(id1, id2) {
  try {
    const avatar1 = (await axios.get(`https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    const avatar2 = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;

    const img1 = await loadImage(Buffer.from(avatar1));
    const img2 = await loadImage(Buffer.from(avatar2));

    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffb6c1";
    ctx.fillRect(0, 0, 800, 400);

    // Circle style DP
    circle(ctx, img1, 200, 200, 150);
    circle(ctx, img2, 600, 200, 150);

    // Heart shape text
    ctx.font = "50px Sans";
    ctx.fillStyle = "#ff0066";
    ctx.textAlign = "center";
    ctx.fillText("💞 Crush 💞", 400, 380);

    const imagePath = __dirname + `/cache/crush_${id1}_${id2}.png`;
    const buffer = canvas.toBuffer();
    fs.writeFileSync(imagePath, buffer);

    return imagePath;
  } catch (e) {
    console.error("Error creating image:", e);
    throw e;
  }
}

// =======================
// 🟣 Draw Circle Function
// =======================
function circle(ctx, img, x, y, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
