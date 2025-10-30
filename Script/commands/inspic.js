const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "inspic",
  version: "5.1.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Download Instagram public photo/video carousel posts one by one with safe fallback API",
  commandCategory: "media",
  usages: ".inspic <instagram link>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const link = args.join(" ").trim();
  if (!link) return api.sendMessage(
    "📸 অনুগ্রহ করে Instagram লিংক দাও!\nউদাহরণ:\n.inspic https://www.instagram.com/p/Cxyz123/",
    event.threadID,
    event.messageID
  );

  api.sendMessage("⏳ মিডিয়া ডাউনলোড হচ্ছে, অপেক্ষা করো...", event.threadID, event.messageID);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  // API fallback list
  const apis = [
    (url) => `https://igram.world/api/ig?url=${encodeURIComponent(url)}`,
    (url) => `https://snapinsta.app/api/ajaxSearch?url=${encodeURIComponent(url)}`,
    (url) => `https://saveig.app/api/ajaxSearch?url=${encodeURIComponent(url)}`
  ];

  let mediaURLs = [];

  // Fetch media URLs from APIs safely
  for (const apiFunc of apis) {
    try {
      const apiURL = apiFunc(link);
      const res = await axios.get(apiURL, { headers: { "User-Agent": "Mozilla/5.0" } });

      if (res.data?.data?.length) {
        mediaURLs = res.data.data.map(item => item.url).filter(Boolean);
        if (mediaURLs.length) break;
      }

      if (res.data?.data && typeof res.data.data === "string") {
        const regex = /(https?:\/\/[^\s"']+\.(?:mp4|jpg|jpeg|png))/g;
        const matches = res.data.data.match(regex);
        if (matches && matches.length) {
          mediaURLs = matches;
          break;
        }
      }

      if (res.data?.media && Array.isArray(res.data.media)) {
        mediaURLs = res.data.media.map(m => m.url).filter(Boolean);
        if (mediaURLs.length) break;
      }
    } catch (err) {
      console.log(`⚠️ API error: ${apiFunc.name || "Unknown"} ->`, err.message);
    }
  }

  if (!mediaURLs.length) return api.sendMessage(
    "❌ মিডিয়া পাওয়া যায়নি! হয়তো লিংকটি প্রাইভেট অথবা API সাপোর্টেড নয়।",
    event.threadID,
    event.messageID
  );

  // Send each media one by one
  for (let i = 0; i < mediaURLs.length; i++) {
    const mediaURL = mediaURLs[i];
    try {
      const fileExt = mediaURL.includes(".mp4") ? ".mp4" : ".jpg";
      const filePath = path.join(cacheDir, `insta_${Date.now()}${fileExt}`);

      const response = await axios({ url: mediaURL, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await new Promise((resolve) => {
        api.sendMessage(
          {
            body: `✅ Instagram মিডিয়া ${i + 1}/${mediaURLs.length} পাঠানো হয়েছে!`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => {
            fs.unlinkSync(filePath);
            resolve();
          }
        );
      });

    } catch (err) {
      console.error(`Download error for media ${i + 1}:`, err.message);
      api.sendMessage(
        `⚠️ মিডিয়া ${i + 1} পাঠানো যায়নি, বাকি মিডিয়া পাঠানো হবে।`,
        event.threadID,
        event.messageID
      );
    }
  }
};
