const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "smartcleaner",
  version: "2.2.0",
  hasPermssion: 2,
  credits: "Hoon (UID restricted)",
  description: "Manual + Auto cache cleaner with human-like simulation (safe & silent)",
  commandCategory: "system",
  usages: "[ext] or nothing for auto mode",
  cooldowns: 0
};

const cacheDirs = ["cache", "temp", "session"];
const protectFiles = ["appstate.json"];
const hoonUID = "61581351693349"; // 🔒 Only Hoon can use

// 🔹 Simulate human-like activity (typing/waiting)
async function simulateHumanActivity() {
  const actions = [
    "typing...",
    "scrolling feed...",
    "checking messages...",
    "moving cursor...",
  ];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const delay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; // 1-5 sec
  console.log(`[HUMAN SIM] ${action} (${delay}ms)`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

// 🔹 Common clean function
async function cleanCache(ext = null, silent = false) {
  let deletedCount = 0;

  for (const dir of cacheDirs) {
    const folder = path.join(__dirname, dir);

    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder);

      for (const file of files) {
        if (protectFiles.includes(file)) continue;
        if (ext && !file.endsWith("." + ext)) continue;

        const filePath = path.join(folder, file);

        // Human-like action before deleting each file
        await simulateHumanActivity();

        try {
          fs.rmSync(filePath, { recursive: true, force: true });
          deletedCount++;
          if (!silent) console.log(`[CLEANED] ${filePath}`);
        } catch (err) {
          console.log(`[ERROR] ${filePath} - ${err.message}`);
        }

        // Random delay 2-8 sec between files
        const fileDelay = Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000;
        await new Promise(resolve => setTimeout(resolve, fileDelay));
      }
    }
  }

  return deletedCount;
}

// 🔸 Manual command use
module.exports.run = async function({ event, api, args }) {
  if (event.senderID !== hoonUID)
    return api.sendMessage("Only Hoon can use this command 🧠", event.threadID, event.messageID);

  let ext = args[0];
  let msg = "";

  if (!ext) {
    msg = "Auto-clean mode already active 🧹 (every 1 hour, appstate.json safe)";
  } else {
    const deleted = await cleanCache(ext, true);
    msg = `✅ Deleted ${deleted} file(s) with extension .${ext}\n🔁 Auto-clean mode still running in background.`;
  }

  api.sendMessage(msg, event.threadID, event.messageID);
};

// 🔹 Auto-clean every 1 hour (safe & silent)
(async function autoStart() {
  console.log("🕒 Smart Auto-Cleaner started (safe mode, every 1 hour)");

  await cleanCache(null, true);

  setInterval(async () => {
    await cleanCache(null, true);
  }, 60 * 60 * 1000);
})();
