module.exports.config = {  
  name: "info",  
  version: "1.0.0",  
  hasPermssion: 0,  
  credits: "Shaon Ahmed",  
  description: "Info bot owner",  
  commandCategory: "For users",  
  hide: true,  
  usages: "",  
  cooldowns: 5,  
};

module.exports.run = async function({ api, event }) {  
  const threadID = event.threadID;  
  const moment = require("moment-timezone");  
  const dateNow = Date.now();  
  const time = process.uptime(),  
        hours = Math.floor(time / 3600),  
        minutes = Math.floor((time % 3600) / 60),  
        seconds = Math.floor(time % 60);  

  const namebot = global.config.BOTNAME || "CYBER-BOT";  

  const msg = `🍀----আসসালামু আলাইকুম----🍀

┏━━•❅•••❈•••❈•••❅•━━┓
「 ${namebot} 」
┗━━•❅•••❈•••❈•••❅•━━┛

______________________________

↓↓_ROBOT SYSTEM INFO_↓↓
» Total Modules: ${global.client.commands.size}
» Ping: ${Date.now() - dateNow}ms

______________________________

↓↓_ROBOT OWNER INFO_↓↓
NAME       : RAKIB
Facebook ID: https://www.facebook.com/profile.php?id=61581351693349
WhatsApp   : +8801729789141

______________________________
----↓↓ROBOT ACTIVE TIME↓↓----
${hours} : ${minutes} : ${seconds} second(s)

______________________________
» TOTAL USERS : ${global.data.allUserID.length}
» TOTAL GROUPS: ${global.data.allThreadID.length}

Thanks for using CYBER-BOT ⚠️`;

  return api.sendMessage({ body: msg }, threadID);
};
