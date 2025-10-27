const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "canvasAll",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "LoL",
    description: "Auto command for all PNGs in cache/canvas",
    commandCategory: "fun",
};

module.exports.run = async ({ api, event }) => {
    try {
        const canvasDir = path.join(__dirname, "cache/canvas");
        const files = fs.readdirSync(canvasDir).filter(f => f.endsWith(".png"));

        // ইউজারের ইনপুট কমান্ড (যেকোনো কমান্ড শুরুতে . থাকতে হবে)
        const input = event.body.startsWith(".") ? event.body.slice(1).toLowerCase() : event.body.toLowerCase();

        // ফাইলের সাথে মেলানো
        const file = files.find(f => f.replace(".png", "").toLowerCase() === input);

        if (!file) {
            return api.sendMessage(`❌ এই কমান্ডের জন্য কোন PNG পাওয়া যায়নি!\nAvailable: ${files.map(f => f.replace(".png","")).join(", ")}`, event.threadID);
        }

        const filePath = path.join(canvasDir, file);

        // Pretty title
        const title = file.replace(".png", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        api.sendMessage({
            body: `✨ Here's your **${title}**!`,
            attachment: fs.createReadStream(filePath)
        }, event.threadID);

    } catch (err) {
        console.error(err);
        api.sendMessage("⚠️ কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করো!", event.threadID);
    }
};
