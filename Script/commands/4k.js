const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// GitHub এ থাকা base API URL JSON
const BASE_URL_JSON = 'https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json';

module.exports.config = {
    name: '4k',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'YourName',
    description: 'Enhance a photo to 4K HD',
    commandCategory: 'Media',
    usages: 'reply or type image URL',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    // চেক করা হয় reply আছে কি না
    let imageUrl = messageReply && 
                   messageReply.attachments && 
                   messageReply.attachments[0] && 
                   messageReply.attachments[0].type === 'photo'
        ? messageReply.attachments[0].url
        : args[0];

    if (!imageUrl) {
        return api.sendMessage("❌ ছবি reply দাও বা URL দাও।", threadID, messageID);
    }

    try {
        // প্রথমে GitHub JSON থেকে base API URL নিয়ে আসি
        const { data: baseApiData } = await axios.get(BASE_URL_JSON);

        /**
         * baseApiUrl.json এর ভেতর যা আছে:
         * {
         *   "dp": "https://mahmud-cdp-apis.onrender.com",
         *   "age": "https://mahmud-age-apis.onrender.com",
         *   "sing": "https://mahmud-sing-apis.onrender.com",
         *   "emojimix": "https://mahmud-emojimix-apis.onrender.com",
         *   "font": "https://mahmud-style-apis.onrender.com",
         *   "anisr": "https://mahmud-anisrx.onrender.com",
         *   "prompt": "https://mahmud-prompt.onrender.com",
         *   "album": "https://mahmud-album7.onrender.com",
         *   "mahmud": "https://mahmud-global-apis.onrender.com",
         *   "jan": "https://mahmud-global-apis.onrender.com/api"
         * }
         *
         * এখানে আমি "mahmud" key-টা ধরে নিচ্ছি 4K আপস্কেলার জন্য।
         * তোমার নিজের API অনুযায়ী চাইলে নিচের key আর path বদলে নিও।
         */

        const baseUrl = baseApiData.mahmud || baseApiData.jan;

        if (!baseUrl) {
            return api.sendMessage("❌ Base API URL পাওয়া যায়নি (mahmud/jan key নেই)।", threadID, messageID);
        }

        // এখানে ধরে নিচ্ছি endpoint:  /upscale (তুমি চাইলে path বদলে নাও)
        const apiLink = `${baseUrl.replace(/\/+$/, '')}/upscale?imageUrl=${encodeURIComponent(imageUrl)}`;

        // API থেকে HD ছবি ডাউনলোড করা
        const response = await axios.get(apiLink, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // টেম্পোরারি ফাইল সেভ করা
        const tempPath = path.join(__dirname, 'cache_4k.jpg');
        await fs.writeFile(tempPath, buffer);

        // ছবি পাঠানো
        await api.sendMessage(
            { body: '✅ 4K Image Ready!', attachment: fs.createReadStream(tempPath) },
            threadID,
            () => fs.unlinkSync(tempPath),
            messageID
        );

    } catch (error) {
        console.error("Image API Error:", error.message || error);
        api.sendMessage(`❌ ছবি প্রসেস করতে পারছি না। Error: ${error.message}`, threadID, messageID);
    }
};
