module.exports.config = {
    name: "usta",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Give a random user a 'usta' image",
    commandCategory: "Fun",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "jimp": ""
    }
};

module.exports.onLoad = async () => {
    const { resolve } = global.nodemodule["path"];
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const path = resolve(__dirname, 'cache/canvas', 'usta.png');
    
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.imgur.com/SgkRkUt.png", path);
};

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    try {
        const pairing_img = await jimp.read(__root + "/usta.png");
        const pathImg = __root + `/usta_${one}_${two}.png`;
        const avatarOne = __root + `/avt_${one}.png`;
        const avatarTwo = __root + `/avt_${two}.png`;

        // Download avatars correctly as binary
        const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));

        const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

        const circleOne = await jimp.read(await circle(avatarOne));
        const circleTwo = await jimp.read(await circle(avatarTwo));
        
        pairing_img
            .composite(circleOne.resize(150, 150), 980, 200)
            .composite(circleTwo.resize(150, 150), 140, 200);

        const raw = await pairing_img.getBufferAsync("image/png");
        fs.writeFileSync(pathImg, raw);

        // Clean up temporary avatars
        fs.unlinkSync(avatarOne);
        fs.unlinkSync(avatarTwo);

        return pathImg;
    } catch (err) {
        console.error("Error making usta image:", err);
        throw err;
    }
}

async function circle(image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event }) {
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;

    try {
        // Sender info
        const senderInfo = await api.getUserInfo(senderID);
        const senderName = senderInfo[senderID].name;

        // Random partner
        const threadInfo = await api.getThreadInfo(threadID);
        const participants = threadInfo.participantIDs.filter(id => id !== senderID);
        if (participants.length === 0) return api.sendMessage("কোনো partner পাওয়া যায়নি!", threadID);

        const partnerID = participants[Math.floor(Math.random() * participants.length)];
        const partnerInfo = await api.getUserInfo(partnerID);
        const partnerName = partnerInfo[partnerID].name;

        // Mentions
        const mentions = [
            { id: senderID, tag: senderName },
            { id: partnerID, tag: partnerName }
        ];

        // Generate and send image
        const one = senderID, two = partnerID;
        const path = await makeImage({ one, two });
        return api.sendMessage({
            body: `এই নে উষ্টা খা।`,
            mentions,
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (err) {
        console.error("Error running usta command:", err);
        return api.sendMessage("উষ্টা তৈরি করতে সমস্যা হয়েছে।", threadID, messageID);
    }
};
