module.exports.config = {
  name: "arrest",
  version: "2.0.2",
  hasPermssion: 0,
  credits: "HOON",
  description: "Arrest a friend you mention (diagnostic build)",
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
  try {
    const { resolve } = global.nodemodule["path"];
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/canvas/`;
    const pathFile = resolve(__dirname, "cache", "canvas", "batgiam.png");

    console.log("[arrest:onLoad] dirMaterial:", dirMaterial);
    if (!existsSync(dirMaterial)) {
      console.log("[arrest:onLoad] creating dir:", dirMaterial);
      mkdirSync(dirMaterial, { recursive: true });
    }

    if (!existsSync(pathFile)) {
      console.log("[arrest:onLoad] downloading base image to:", pathFile);
      await downloadFile("https://i.imgur.com/ep1gG3r.png", pathFile);
      console.log("[arrest:onLoad] download complete");
    } else {
      console.log("[arrest:onLoad] base image already exists");
    }
  } catch (err) {
    console.error("[arrest:onLoad] ERROR:", err && err.stack ? err.stack : err);
  }
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let avatarOne, avatarTwo, pathImg;
  try {
    console.log("[makeImage] starting: one=", one, " two=", two);
    const basePath = __root + "/batgiam.png";
    if (!fs.existsSync(basePath)) throw new Error("Base image missing: " + basePath);

    let batgiam_img = await jimp.read(basePath);
    pathImg = __root + `/batgiam_${one}_${two}.png`;
    avatarOne = __root + `/avt_${one}.png`;
    avatarTwo = __root + `/avt_${two}.png`;

    console.log("[makeImage] downloading avatar for", one);
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));
    console.log("[makeImage] avatar saved:", avatarOne);

    console.log("[makeImage] downloading avatar for", two);
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));
    console.log("[makeImage] avatar saved:", avatarTwo);

    console.log("[makeImage] creating circle one");
    let circleOneBuf = await circle(avatarOne);
    console.log("[makeImage] creating circle two");
    let circleTwoBuf = await circle(avatarTwo);

    let circleOne = await jimp.read(circleOneBuf);
    let circleTwo = await jimp.read(circleTwoBuf);

    console.log("[makeImage] compositing images");
    batgiam_img.resize(500, 500)
      .composite(circleOne.resize(100, 100), 375, 9)
      .composite(circleTwo.resize(100, 100), 160, 92);

    let raw = await batgiam_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);
    console.log("[makeImage] final image written:", pathImg);

    // cleanup avatars
    try { fs.unlinkSync(avatarOne); console.log("[makeImage] removed temp", avatarOne); } catch (e) { }
    try { fs.unlinkSync(avatarTwo); console.log("[makeImage] removed temp", avatarTwo); } catch (e) { }

    return pathImg;
  } catch (err) {
    console.error("[makeImage] ERROR:", err && err.stack ? err.stack : err);
    // try to cleanup on error
    try { if (avatarOne && fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne); } catch (e) { }
    try { if (avatarTwo && fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo); } catch (e) { }
    throw err;
  }
}

async function circle(imagePath) {
  const jimp = require("jimp");
  try {
    const image = await jimp.read(imagePath);
    image.circle();
    return await image.getBufferAsync("image/png");
  } catch (err) {
    console.error("[circle] ERROR reading/processing:", imagePath, err && err.stack ? err.stack : err);
    throw err;
  }
}

module.exports.run = async function ({ event, api, args }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;

  try {
    // safe mentions handling
    const mentionObj = event.mentions || {};
    const mentionIDs = Object.keys(mentionObj);

    if (mentionIDs.length === 0) {
      return api.sendMessage("ব্যবহার: arrest @username — দয়া করে একজনকে ম্যানশন করো", threadID, messageID);
    }

    const mention = mentionIDs[0];
    if (mention === senderID) return api.sendMessage("নিজেকে Arrest করতে পারবে না 😅", threadID, messageID);

    // call makeImage with diagnostics
    let path;
    try {
      console.log("[run] calling makeImage with:", { one: senderID, two: mention });
      path = await makeImage({ one: senderID, two: mention });
      console.log("[run] makeImage returned:", path);
    } catch (err) {
      console.error("[run] makeImage error:", err && err.stack ? err.stack : err);
      // send short error to chat for debugging
      const shortMsg = (err && err.message) ? `ERR: ${err.message}` : "Unknown error while making image";
      return api.sendMessage(`কিছু সমস্যা হয়েছে: ${shortMsg}\n(কনসোলে পুরো স্ট্যাক দেখো)`, threadID, messageID);
    }

    // send and cleanup
    await api.sendMessage({
      body:
        "╭──────•◈•───────╮\n" +
        " 𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 \n\n" +
        `—হালা গরু চোর তোরে আজকে হাতে নাতে ধরছি পালাবি কই_😸💁‍♀️ @${(typeof mentionObj[mention] === "string") ? mentionObj[mention].replace("@","") : "Friend"}\n\n\n` +
        "𝗠𝗔𝗗𝗘 𝗕𝗬:\n Ullash ッ\n" +
        "╰──────•◈•───────╯",
      mentions: [{
        tag: (typeof mentionObj[mention] === "string") ? mentionObj[mention].replace("@","") : "Friend",
        id: mention
      }],
      attachment: fs.createReadStream(path)
    }, threadID, async (err) => {
      try { fs.unlinkSync(path); } catch (e) { }
      if (err) {
        console.error("[run] sendMessage error:", err && err.stack ? err.stack : err);
      }
    }, messageID);

  } catch (err) {
    console.error("[run] UNEXPECTED ERROR:", err && err.stack ? err.stack : err);
    return api.sendMessage("কিছু সমস্যা হয়েছে। বিস্তারিত কনসোলে দেখো।", threadID, messageID);
  }
};
