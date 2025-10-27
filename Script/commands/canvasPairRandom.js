const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "canvasRandomPair",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "LoL",
    description: "Random PNG + random pairing for any command",
    commandCategory: "fun",
};

module.exports.run = async ({ api, event, Users }) => {
    try {
        // PNG ফাইল path
        const canvasDir = path.join(__dirname, "cache/canvas");
        const files = fs.readdirSync(canvasDir).filter(f => f.endsWith(".png"));
        if (!files.length) return api.sendMessage("⚠️ কোনো PNG পাওয়া যায়নি!", event.threadID);

        // Random PNG
        const file = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(canvasDir, file);
        const title = file.replace(".png", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        // Command-agnostic: pick any user from thread
        const members = event.participantIDs.filter(id => id != event.senderID);
        const pairedUserID = members.length ? members[Math.floor(Math.random() * members.length)] : event.senderID;
        const pairedName = Users.getName(pairedUserID);

        // Send message
        api.sendMessage({
            body: `💞 ${Users.getName(event.senderID)} is paired with ${pairedName}!\nHere's a **${title}**!`,
            attachment: fs.createReadStream(filePath),
            mentions: [{ tag: pairedName, id: pairedUserID }]
        }, event.threadID);

    } catch (err) {
        console.error(err);
        api.sendMessage("⚠️ কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করো!", event.threadID);
    }
};
