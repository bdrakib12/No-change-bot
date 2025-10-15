module.exports.config = {
    name: "quiz",
    version: "1.0.0",
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    hasPermssion: 0,
    description: "সঠিক উত্তর দিন (True/False)",
    commandCategory: "game",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "he": ""
    }
};

const axios = require("axios");
const he = require("he");

const translateMessage = global.translateMessage || (async (text, lang) => text);

module.exports.handleReaction = ({ api, event, handleReaction }) => {
    if (event.userID != handleReaction.author) return;

    let response = event.reaction == "👍" ? "True" : "False";

    if (response == handleReaction.answer) {
        api.sendMessage("🎉 অভিনন্দন! তুমি সঠিক উত্তর দিয়েছো।", event.threadID);
    } else {
        api.sendMessage("😢 দুঃখিত! ভুল উত্তর।", event.threadID);
    }

    const indexOfHandle = global.client.handleReaction.findIndex(e => e.messageID == handleReaction.messageID);
    if (indexOfHandle !== -1) global.client.handleReaction.splice(indexOfHandle, 1);

    handleReaction.answerYet = 1;
    return global.client.handleReaction.push(handleReaction);
}

module.exports.run = async ({ api, event, args }) => {
    let difficulties = ["easy", "medium", "hard"];
    let difficulty = args[0];
    if (!difficulties.includes(difficulty)) difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    let fetch = await axios(`https://opentdb.com/api.php?amount=1&encode=url3986&type=boolean&difficulty=${difficulty}`);
    if (!fetch.data || !fetch.data.results || fetch.data.results.length == 0) 
        return api.sendMessage("⚠️ প্রশ্ন পাওয়া যায়নি, সার্ভার ব্যস্ত।", event.threadID);

    let question = he.decode(decodeURIComponent(fetch.data.results[0].question));
    let banglaQuestion = await translateMessage(question, "bn");

    return api.sendMessage(
        `📝 প্রশ্ন:\n${banglaQuestion}\n\n👍: সত্য (True)     😢: মিথ্যা (False)`,
        event.threadID,
        async (err, info) => {
            global.client.handleReaction.push({
                name: "quiz",
                messageID: info.messageID,
                author: event.senderID,
                answer: fetch.data.results[0].correct_answer,
                answerYet: 0
            });

            await new Promise(resolve => setTimeout(resolve, 20000));

            const indexOfHandle = global.client.handleReaction.findIndex(e => e.messageID == info.messageID);
            if (indexOfHandle !== -1 && global.client.handleReaction[indexOfHandle].answerYet !== 1) {
                api.sendMessage(`⏰ সময় শেষ! সঠিক উত্তর: ${fetch.data.results[0].correct_answer}`, event.threadID, info.messageID);
                global.client.handleReaction.splice(indexOfHandle, 1);
            }
        }
    );
        }
