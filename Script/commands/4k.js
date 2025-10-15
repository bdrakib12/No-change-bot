const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

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
    let imageUrl = messageReply && messageReply.attachments && messageReply.attachments[0].type === 'photo'
        ? messageReply.attachments[0].url
        : args[0];

    if (!imageUrl) {
        return api.sendMessage("❌ ছবি reply দাও বা URL দাও।", threadID, messageID);
    }

    try {
        // API লিংক (নতুন ফ্রি API)
        const apiLink = `https://imageupscaler.onrender.com/upscale?imageUrl=${encodeURIComponent(imageUrl)}`;

        // প্রথমে API থেকে HD ছবি ডাউনলোড করা
        const response = await axios.get(apiLink, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // টেম্পোরারি ফাইল সেভ করা
        const tempPath = path.join(__dirname, 'cache_4k.jpg');
        await fs.writeFile(tempPath, buffer);

        // ছবি পাঠানো
        await api.sendMessage({ body: '✅ 4K Image Ready!', attachment: fs.createReadStream(tempPath) }, threadID, () => fs.unlinkSync(tempPath), messageID);

    } catch (error) {
        console.error("Image API Error:", error.message);
        api.sendMessage(`❌ ছবি প্রসেস করতে পারছি না। Error: ${error.message}`, threadID, messageID);
    }
};
