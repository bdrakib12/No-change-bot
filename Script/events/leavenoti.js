module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "hoon",
	description: "Notify the Bot or the person leaving the group with a random gif/photo/video",
	dependencies: {
		"fs-extra": "",
		"path": "",
		"moment-timezone": ""
	}
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

	const path = join(__dirname, "cache", "leaveGif", "randomgif");
	if (!existsSync(path)) mkdirSync(path, { recursive: true });	

	return;
}

module.exports.run = async function({ api, event, Users, Threads }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
	const { createReadStream, existsSync, readdirSync } = global.nodemodule["fs-extra"];
	const { join } =  global.nodemodule["path"];
	const { threadID } = event;
	const moment = require("moment-timezone");

	const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");
	const hours = moment.tz("Asia/Dhaka").format("HH");

	const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
	const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
	const type = (event.author == event.logMessageData.leftParticipantFbId) ? "leave" : "managed";

	// মেসেজ সেট
	let msg = (typeof data.customLeave == "undefined") ? 
`╭═════⊹⊱✫⊰⊹═════╮
⚠️ গুরুতর ঘোষণা ⚠️
╰═════⊹⊱✫⊰⊹═════╯

{session} হইল!  
{name} ভাই/বোন, এই মাত্র গ্রুপ থেকে নিখোঁজ হয়েছেন!  

গ্রুপবাসীর পক্ষ থেকে জানানো যাচ্ছে যে, তিনি এখন **গ্রুপে নেই**,  
কিন্তু আমাদের হৃদয়ে তিনি থাকবেন।  

⏰ তারিখ ও সময়: {time}  
⚙️ স্ট্যাটাস: {type}  
✍️ মন্তব্য করে জানাও: তোমার কী ফিলিংস হইছে এই বিচ্ছেদে?  

— স্বাগত ও বিদায়ের সৌজন্যে,  
**hoon**`
	: data.customLeave;

	msg = msg.replace(/\{name}/g, name)
	         .replace(/\{type}/g, type)
	         .replace(/\{session}/g, hours <= 10 ? "𝙈𝙤𝙧𝙣𝙞𝙣𝙜" : 
	           hours > 10 && hours <= 12 ? "𝘼𝙛𝙩𝙚𝙧𝙉𝙤𝙤𝙣" :
	           hours > 12 && hours <= 18 ? "𝙀𝙫𝙚𝙣𝙞𝙣𝙜" : "𝙉𝙞𝙜𝙝𝙩")
	         .replace(/\{time}/g, time);

	// পিক/ভিডিও সাপোর্ট
	const randomPath = readdirSync(join(__dirname, "cache", "leaveGif", "randomgif"));

	let formPush;
	if (randomPath.length != 0) {
		const pathRandom = join(__dirname, "cache", "leaveGif", "randomgif", `${randomPath[Math.floor(Math.random() * randomPath.length)]}`);
		formPush = { body: msg, attachment: createReadStream(pathRandom) };
	} else {
		formPush = { body: msg };
	}

	return api.sendMessage(formPush, threadID);
		}
