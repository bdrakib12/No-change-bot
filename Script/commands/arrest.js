module.exports.config = {
  name: "arrest",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "MAHBUB SHAON",
  description: "Arrest a friend you mention",
  commandCategory: "tagfun",
  usages: "[mention]",
  cooldowns: 2,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const pathFile = resolve(__dirname, "cache", "canvas", "batgiam.png");

  // ensure dir exists
  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });

  // download the base image if not exists
  if (!existsSync(pathFile)) {
    await downloadFile("https://i.imgur.com/ep1gG3r.png", pathFile);
  }
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  try {
    let batgiam_img = await jimp.read(__root + "/batgiam.png");
    let pathImg = __root + `/batgiam_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    // download avatars (arraybuffer) and write raw buffer
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

    // make circle avatars
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));

    // composite on base image (positions can be adjusted)
    batgiam_img.resize(500, 500)
      .composite(circleOne.resize(100, 100), 375, 9)
      .composite(circleTwo.resize(100, 100), 160, 92);

    let raw = await batgiam_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);

    // cleanup avatar temp files
    try { fs.unlinkSync(avatarOne); } catch (e) { /* ignore */ }
    try { fs.unlinkSync(avatarTwo); } catch (e) { /* ignore */ }

    return pathImg;
  } catch (err) {
    // try cleanup on error
    try { if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne); } catch (e) {}
    try { if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo); } catch (e) {}
    throw err;
  }
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;

  try {
    // safe check for mentions object
    const mentionObj = event.mentions || {};
    const mentionIDs = Object.keys(mentionObj);

    if (mentionIDs.length === 0) {
      // no mention -> tell the user how to use
      return api.sendMessage("কোনো কারো ম্যানশন করো। উদাহরণ: arrest @user", threadID, messageID);
    }

    // take the first mentioned user's id
    const mention = mentionIDs[0];
    // mentionObj[mention] typically holds the display name, make sure it's string
    const tag = (typeof mentionObj[mention] === "string") ? mentionObj[mention].replace("@", "") : "Friend";

    // prevent self-arrest
    if (mention === senderID) {
      return api.sendMessage("নিজেকে Arrest করা যাবে না 😅", threadID, messageID);
    }

    const one = senderID, two = mention;
    const path = await makeImage({ one, two });

    // send message with mention and attachment, then cleanup
    await api.sendMessage({
      body:
        "╭──────•◈•───────╮\n" +
        " 𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 \n\n" +
        `—হালা গরু চোর তোরে আজকে হাতে নাতে ধরছি পালাবি কই_😸💁‍♀️ @${tag}\n\n\n` +
        "𝗠𝗔𝗗𝗘 𝗕𝗬:\n Ullash ッ\n" +
        "╰──────•◈•───────╯",
      mentions: [{
        tag: tag,
        id: mention
      }],
      attachment: fs.createReadStream(path)
    }, threadID, async (err) => {
      // remove generated image after send
      try { fs.unlinkSync(path); } catch (e) { /* ignore */ }
      if (err) console.error(err);
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("কিছু সমস্যা হয়েছে। আবার চেষ্টা করো।", threadID, messageID);
  }
};
