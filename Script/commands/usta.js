const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "usta",
    version: "1.0",
    hasPermssion: 0,
    credits: "Rakib",
    description: "ম্যানশন বা রিপ্লাই করা ইউজারকে GIF এর মাধ্যমে আক্রমণ",
    commandCategory: "Fun",
    usages: "[reply/tag]",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async function({ api, event }) {
    try {
        let mention = event.senderID;
        let tagName = "এই নে উষ্টা খা 🦵";

        if (event.type === "message_reply") {
            mention = event.messageReply.senderID;
        } else if (event.mentions && Object.keys(event.mentions).length > 0) {
            mention = Object.keys(event.mentions)[0];
        }

        const gifPath = __dirname + "/usta.gif";

        api.sendMessage({
            body: `@${mention} ${tagName}`,
            mentions: [{ tag: tagName, id: mention }],
            attachment: fs.createReadStream(gifPath)
        }, event.threadID);
    } catch (err) {
        console.log(err);
    }
};
