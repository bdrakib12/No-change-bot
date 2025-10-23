// main.js (bot entry point)
global.botDisabled = false; // ডিফল্টভাবে বট চালু থাকবে
const admins = ["61578362017875", "61581351693349"];

module.exports.handleEvent = async ({ event, api }) => {

    // যদি বট disabled থাকে, শুধু admin ছাড়া কেউ event handle করতে পারবে না
    if (global.botDisabled && !admins.includes(event.senderID)) return;

    const message = event.body || "";

    // উদাহরণ কমান্ড
    if (message === ".hello") {
        return api.sendMessage("হ্যালো! বট চলছে ✅", event.threadID);
    }

    // অন্যান্য কমান্ডগুলো handle করতে হবে এখানে
}
