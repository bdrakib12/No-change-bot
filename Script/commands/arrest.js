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

const fs = global.nodemodule["fs-extra"];
const path = global.nodemodule["path"];
const axios = global.nodemodule["axios"];
const jimp = global.nodemodule["jimp"];
const { downloadFile } = global.utils;

module.exports.onLoad = async () => {
  try {
    const dirMaterial = path.resolve(__dirname, "cache", "canvas");
    const pathFile = path.join(dirMaterial, "batgiam.png");

    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });

    if (!fs.existsSync(pathFile)) {
      console.log("[arrest:onLoad] Downloading base image...");
      try {
        await downloadFile("https://i.imgur.com/ep1gG3r.png", pathFile);
        console.log("[arrest:onLoad] Download complete");
      } catch (err) {
        console.error("[arrest:onLoad] downloadFile failed:", err.message);
      }
    }
  } catch (err) {
    console.error("[arrest:onLoad] ERROR:", err.message);
  }
};

async function getAvatarFB(userID) {
  let retry = 3;
  while (retry > 0) {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: 'arraybuffer' }
      );
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.log(`[getAvatarFB] Rate limit hit for ${userID}, retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        retry--;
      } else throw err;
    }
  }
  throw new Error(`Graph API rate limit exceeded for ${userID}`);
}

async function circle(imagePath) {
  try {
    const image = await jimp.read(imagePath);
    image.circle();
    return await image.getBufferAsync("image/png");
  } catch (err) {
    console.error("[circle] ERROR reading/processing:", imagePath, err.message);
    throw err;
  }
}

async function makeImage({ one, two }) {
  try {
    const __root = path.resolve(__dirname, "cache", "canvas");
    const basePath = path.join(__root, "batgiam.png");
    if (!fs.existsSync(basePath)) throw new Error("Base image missing: " + basePath);

    const batgiam_img = await jimp.read(basePath);
    const pathImg = path.join(__root, `batgiam_${one}_${two}.png`);
    const avatarOnePath = path.join(__root, `avt_${one}.png`);
    const avatarTwoPath = path.join(__root, `avt_${two}.png`);

    fs.writeFileSync(avatarOnePath, Buffer.from(await getAvatarFB(one)));
    fs.writeFileSync(avatarTwoPath, Buffer.from(await getAvatarFB(two)));

    const circleOne = await jimp.read(await circle(avatarOnePath));
    const circleTwo = await jimp.read(await circle(avatarTwoPath));

    batgiam_img.resize(500, 500)
      .composite(circleOne.resize(100, 100), 375, 9)
      .composite(circleTwo.resize(100, 100), 160, 92);

    const raw = await batgiam_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);

    try { fs.unlinkSync(avatarOnePath); } catch(e) {}
    try { fs.unlinkSync(avatarTwoPath); } catch(e) {}

    return pathImg;
  } catch (err) {
    console.error("[makeImage] ERROR:", err.message);
    throw err;
  }
}

module.exports.run = async function({ event, api, args }) {
  const { threadID, messageID, senderID } = event;
  const mentionObj = event.mentions || {};
  const mentionIDs = Object.keys(mentionObj);

  if (mentionIDs.length === 0)
    return api.sendMessage("ব্যবহার: arrest @username — দয়া করে একজনকে ম্যানশন করো", threadID, messageID);

  const mention = mentionIDs[0];
  if (mention === senderID)
    return api.sendMessage("নিজেকে Arrest করতে পারবে না 😅", threadID, messageID);

  let path;
  try {
    path = await makeImage({ one: senderID, two: mention });
  } catch (err) {
    return api.sendMessage(`কিছু সমস্যা হয়েছে: ${err.message}`, threadID, messageID);
  }

  try {
    await api.sendMessage({
      body:
        `╭──────•◈•───────╮\n 𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁\n\n—হালা গরু চোর তোরে আজকে হাতে নাতে ধরছি পালাবি কই_😸💁‍♀️ @${mentionObj[mention].replace("@","")}\n\n𝗠𝗔𝗗𝗘 𝗕𝗬:\n HOON\n╰──────•◈•─────╯`,
      mentions: [{ tag: mentionObj[mention].replace("@",""), id: mention }],
      attachment: fs.createReadStream(path)
    }, threadID, async (err) => { try { fs.unlinkSync(path); } catch(e) {} }, messageID);
  } catch (err) {
    console.error("[run] sendMessage error:", err.message);
  }
};
