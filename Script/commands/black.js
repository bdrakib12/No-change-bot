const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'black',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Rakib',
    description: 'Convert image to black style using Rubish API',
    commandCategory: 'Media',
    usages: 'reply image or give image URL',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let imageUrl = null;

    // Reply করা ছবি নিলে
    if (
        messageReply &&
        messageReply.attachments &&
        messageReply.attachments[0] &&
        messageReply.attachments[0].type === 'photo'
    ) {
        imageUrl = messageReply.attachments[0].url;
    }
    // না হলে args থেকে
    else if (args[0]) {
        imageUrl = args[0];
    }

    if (!imageUrl) {
        return api.sendMessage(
            "❌ একটি ছবিতে reply দাও বা ছবির URL দাও।",
            threadID,
            messageID
        );
    }

    try {
        const apiUrl = `https://rubish.online/rubish/edit-black?url=${encodeURIComponent(imageUrl)}&apikey=rubish69`;

        console.log("Black Effect API LINK:", apiUrl);

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        const tempPath = path.join(__dirname, 'cache_black.jpg');
        await fs.writeFile(tempPath, buffer);

        await api.sendMessage(
            {
                body: '✅ Black Effect Image Ready!',
                attachment: fs.createReadStream(tempPath)
            },
            threadID,
            () => fs.unlinkSync(tempPath),
            messageID
        );

    } catch (error) {
        console.error("Black Effect API Error:", error.message || error);
        api.sendMessage(
            `❌ ছবি প্রসেস করা যায়নি।\nError: ${error.message || 'Unknown error'}`,
            threadID,
            messageID
        );
    }
};
