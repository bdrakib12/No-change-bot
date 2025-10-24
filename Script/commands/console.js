const chalk = require("chalk");
const moment = require("moment-timezone");

module.exports.config = {
  name: "console",
  version: "1.0.3",
  hasPermssion: 2,
  credits: "CYBER ☢️ BOT TEAM (Enhanced by GPT-5)",
  description: "রঙিনভাবে কনসোলে মেসেজ লগ দেখায় এবং Owner মেসেজ আলাদা করে দেখায়।",
  commandCategory: "system",
  usages: ".console on / .console off",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args, Threads, Users }) {
  const { threadID, senderID, body } = event;

  // থ্রেড ও ইউজার ইনফো নেওয়া
  const threadInfo = await Threads.getData(threadID);
  const userInfo = await Users.getData(senderID);

  const threadName = threadInfo.threadName || "Unnamed Group";
  const senderName = senderID == "61581351693349" ? "Hoon (Owner)" : userInfo.name || "Unknown User";
  const messageBody = body || "No message";
  const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY || hh:mm:ss A");

  // র‍্যান্ডম রঙ সিলেক্ট
  const colors = [
    "#FF99FF", "#47B5FF", "#33FFFF", "#FF0033",
    "#00FF99", "#FF66CC", "#66FF33", "#FFFF33",
    "#33FF99", "#CC33FF", "#FF9900", "#FF0000"
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // কনসোল টগল সিস্টেম
  if (!global.consoleEnabled) global.consoleEnabled = true;

  if (args[0] === "on") {
    global.consoleEnabled = true;
    return api.sendMessage("✅ Console logging চালু করা হলো!", threadID);
  }

  if (args[0] === "off") {
    global.consoleEnabled = false;
    return api.sendMessage("❌ Console logging বন্ধ করা হলো!", threadID);
  }

  // লগিং অংশ
  if (global.consoleEnabled) {
    // সাধারণ লগ
    console.log(chalk.hex(randomColor)(
      `\n[📝]→ Group: ${threadName}\n[🔎]→ Group ID: ${threadID}\n[👤]→ User: ${senderName}\n[🆔]→ UID: ${senderID}\n[💬]→ Message: ${messageBody}\n[⏰]→ Time: ${time}`
    ));

    // যদি Owner মেসেজ পাঠায়
    if (senderID == "61581351693349") {
      console.log(chalk.hex("#FFD700")("\n💠 OWNER MESSAGE DETECTED 💠\n"));
    }
  }
};
