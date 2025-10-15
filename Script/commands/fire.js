module.exports.config = {
  name: "fire",
  version: "2.3.0-bn",
  hasPermssion: 2,
  credits: "Hoon (Royal Edition)",
  description: "🔥 রাজকীয় আগুন মোড চালু করো",
  commandCategory: "fun",
  usages: "fire [on/off]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const hoonID = "61581351693349"; // ✅ মহারাজ HOON-এর UID
  const sender = event.senderID;
  const threadID = event.threadID;

  if (sender !== hoonID) return; // Non-HOON চুপ থাকবে

  const sub = (args[0] || "").toLowerCase();

  // 🔥 Fire ON cinematic messages
  const fireLines = [
    "🔥 সতর্কতা! ফায়ার মোড চালু হচ্ছে…",
    "⚡ প্রসেসিং পাওয়ার বেড়ে গেছে 9000+ ⚙️",
    "😈 সব প্রজা সাবধান! এখন থেকে আগুনে জ্বলবে পুরো চ্যাট!",
    "💀 HOON আগুন ছেড়ে দিয়েছে… কেউ বাঁচবে না!",
    "🔥 Fire mode activated successfully. System temperature: 999°C 🌋",
    "💥 Boom! Chatroom now under fire control 🚀"
  ];

  // ❄️ Fire OFF cinematic messages
  const coolLines = [
    "🧊 ফায়ার মোড বন্ধ করা হচ্ছে…",
    "💧 তাপমাত্রা নেমে আসছে ধীরে ধীরে…",
    "😮‍💨 সব আগুন নিভে গেছে, এখন শান্তি ফিরে এসেছে 🌙",
    "🪫 HOON আগুন বন্ধ করেছে। System cool mode activated ❄️",
    "🧘‍♂️ চ্যাটে এখন ঠাণ্ডা হাওয়া বইছে…"
  ];

  if (sub === "on") {
    fireLines.forEach((msg, i) => {
      setTimeout(() => api.sendMessage(msg, threadID), i * 2000); // প্রতি ২ সেকেন্ডে
    });
    return;
  }

  if (sub === "off") {
    coolLines.forEach((msg, i) => {
      setTimeout(() => api.sendMessage(msg, threadID), i * 2000); // প্রতি ২ সেকেন্ডে
    });
    return;
  }

  // শুধু ".fire" দিলে স্ট্যাটাস দেখাবে
  api.sendMessage("🔥 রাজকীয় ফায়ার মোড স্ট্যাটাস: ON/OFF (HOON মোড অনুযায়ী)", threadID);
};
