module.exports.config = {
  name: "help",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Edited by Rakib (Based on Cyber Ullash)",
  description: "Simple text help menu without image",
  commandCategory: "system",
  usages: "[name module]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // তুমি চাইলে prefix dynamic করতেও পারো, আপাতত ধরে নিচ্ছি "!"
  const prefix = global.config.PREFIX || ".";

  const helpText = `
╭──────•◈•──────╮
│   𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗖𝗵𝗮𝘁 𝗕𝗼𝘁
│   📜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧 📜
╰──────•◈•──────╯

📷 𝗜𝗠𝗔𝗚𝗘 & 𝗣𝗛𝗢𝗧𝗢
${prefix}pin <keyword>
${prefix}pin <keyword> mirror photo-10
${prefix}edit <reply/photo-link>
${prefix}mirror <name/photo>
${prefix}photo <name>
${prefix}anime <name>
${prefix}draw <prompt>
${prefix}banner <name>
${prefix}fbcover <name>

🎵 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 / 𝗠𝗨𝗦𝗜𝗖 / 𝗩𝗜𝗗𝗘𝗢
${prefix}ytmp3 <link>
${prefix}ytmp4 <link>
${prefix}tiktok <link>
${prefix}tikvd <link>
${prefix}shortvd <link>
${prefix}soundcloud <link>
${prefix}music <name>
${prefix}radio

⚙️ 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 / 𝗜𝗡𝗙𝗢
${prefix}help
${prefix}help all
${prefix}menu
${prefix}ping
${prefix}uptime
${prefix}prefix <new>
${prefix}restart
${prefix}status
${prefix}update

👑 𝗔𝗗𝗠𝗜𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
${prefix}admin
${prefix}kick <uid/reply>
${prefix}add <uid>
${prefix}ndh
${prefix}groupinfo
${prefix}del
${prefix}noti on/off
${prefix}mode <admin/all>

💬 𝗙𝗨𝗡 / 𝗖𝗛𝗔𝗧 / 𝗚𝗔𝗠𝗘
${prefix}sim <text>
${prefix}love <name>
${prefix}fish
${prefix}work
${prefix}daily
${prefix}cave
${prefix}cardinfo <bin>
${prefix}weather <city>

🌐 𝗔𝗜 & 𝗧𝗢𝗢𝗟𝗦
${prefix}ai <question>
${prefix}math <query>
${prefix}translate <lang> <text>
${prefix}news
${prefix}instagram <link>
${prefix}subnautica
${prefix}subnau
${prefix}shortlink <url>
${prefix}voice <text>

🪙 𝗘𝗖𝗢𝗡𝗢𝗠𝗬
${prefix}balance
${prefix}bank
${prefix}transfer <uid> <amount>
${prefix}rank
${prefix}levelup

🔐 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗛𝗜𝗗𝗗𝗘𝗡
${prefix}eval <code>
${prefix}log on/off
${prefix}reload
${prefix}backup
`;

  return api.sendMessage(helpText, threadID, messageID);
};
