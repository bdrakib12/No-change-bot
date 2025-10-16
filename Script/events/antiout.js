module.exports.config = {
 name: "antiout",
 eventType: ["log:unsubscribe"],
 version: "0.0.1",
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
 let data = (await Threads.getData(event.threadID)).data || {};
 if (data.antiout == false) return;
 if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
 const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
 const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "Koi Ase Pichware Mai Lath Marta Hai?";
 if (type == "self-separation") {
  api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
   if (error) {
  api.sendMessage(`😎 সরি বস ${name}... চেষ্টা করেও ওই আবালরে এড়াতে পারলাম না 😞\n\
হয়তো ব্লক করেছে বা মেসেঞ্জার বন্ধ — তাই এড করা সম্ভব হয়নি।\n\n\
⚠️ তবে মনে রাখুক—এই সিস্টেম মাফ করে না!\n\
পরের বার এমন ঘটনা ঘটলে মাফিয়া মোড নিজে থেকেই একশন নেবে 😈\n\n\
──────·····✦·····──────`, event.threadID)

} else api.sendMessage(`এইটা ভাই ${name} তোমার মামুর বাড়ি না। এখান থেকে যেতে হলে, এডমিনের ক্লিয়ারেন্স লাগে — বুঝলা? 😎\n\
তুই পারমিশন ছাড়া লিভ নিছোস — তাই এখন মাফিয়া সিস্টেম চালু হয়ে গেছে 🔥\n\n\
⚠️ মনে রাখ—এই গ্যাং কাউরে মাফ করে না!\n\
পরের বার এমন করলে মাফিয়া মোড নিজে থেকেই একশন নেবে 😈\n\n\
──────·····✦·····─────`, event.threadID);
