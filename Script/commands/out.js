module.exports.config = {
    name: "leave",
    version: "1.0.0",
    hasPermssion: 2, // শুধুমাত্র admin ব্যবহারকারীর জন্য
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Out of the group",
    commandCategory: "Admin",
    usages: "out [tid]",
    cooldowns: 3
};

const HOON_ID = "61581351693349"; // তোমার HOON UID

module.exports.run = async function({ api, event, args }) {
    const senderID = event.senderID;

    // যদি HOON না হয়
    if(senderID !== HOON_ID) {
        return api.sendMessage(
            `✨ শুধু HOON ব্যবহার করতে পারবে এই কমান্ড।\n✨ তুমি শুধুমাত্র প্রজা, তাই পারবে না 🙂🐸`,
            event.threadID,
            event.messageID
        );
    }

    const tid = args.join(" "); // যদি ব্যবহারকারী group ID দেয়
    if (!tid) {
        // যদি TID না দেয়, তখন current group থেকে বের হবে
        return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    } else {
        // অন্য group ID দিলে সেখানে চলে যাবে
        return api.removeUserFromGroup(api.getCurrentUserID(), tid, () => 
            api.sendMessage("The bot has left this group", event.threadID, event.messageID)
        );
    }
};
