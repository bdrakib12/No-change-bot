module.exports.config = {  
  name: "info",  
  version: "1.2.6",  
  hasPermssion: 0,  
  credits: "Shaon Ahmed",  
  description: "info bot owner",  
  commandCategory: "For users",  
  hide: true,  
  usages: "",  
  cooldowns: 5,  
};  

module.exports.run = async function ({ api, event, args, Users, permssion, getText, Threads }) {  
  const { threadID } = event;  
  const moment = require("moment-timezone");  
  const dateNow = Date.now();  
  const time = process.uptime(),  
        hours = Math.floor(time / (60 * 60)),  
        minutes = Math.floor((time % (60 * 60)) / 60),  
        seconds = Math.floor(time % 60);  

  const config = global.config;  
  const PREFIX = config.PREFIX;  
  const namebot = config.BOTNAME;  

  return api.sendMessage({ 
    body: `🍀----আসসালামু আলাইকুম----🍀

┏━━•❅•••❈•••❈•••❅•━━┓
「 ${namebot} 」
┗━━•❅•••❈•••❈•••❅•━━┛

______________________________

↓↓_𝗥𝗢𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢_↓↓

» Prefix system: ${PREFIX}
» Total Modules: ${global.client.commands.size}
» Ping: ${Date.now() - dateNow}ms

______________________________

↓↓_𝗥𝗢𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢_↓↓

𝗡𝗔𝗠𝗘      : RAKIB
Facebook ID : https://www.facebook.com/profile.php?id=61581351693349
WhatsApp    : +8801729789141

______________________________
----↓↓𝙍𝙤𝙗𝙤𝙩 𝙖𝙘𝙩𝙞𝙫𝙚 𝙩𝙞𝙢𝙚↓↓----
${hours} : ${minutes} : ${seconds} second(s)

______________________________
» TOTAL USERS : ${global.data.allUserID.length}
» TOTAL GROUPS : ${global.data.allThreadID.length}

thanks for using
𝐂𝐘𝐁𝐄𝐑 ☢️ - 𝐁𝐎𝐓 ⚠️

--------------------------------------------------`
  }, threadID);  
};
