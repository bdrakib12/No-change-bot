module.exports.config = {
    name: "antiout",
    version: "1.0.1", // Updated version to reflect changes
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ and Gemini", // Added credit
    hasPermssion: 1,
    description: "Turn on/off antiout. Automatically adds users back when they leave, except for a specific UID.",
    usages: "antiout on/off",
    commandCategory: "system",
    cooldowns: 0
};

const EXCLUDED_UID = "61581351693349"; // The specific UID to exclude

module.exports.run = async({ api, event, Threads}) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    
    // Toggle the antiout setting
    if (typeof data["antiout"] == "undefined" || data["antiout"] == false) data["antiout"] = true;
    else data["antiout"] = false;
    
    // Save the new setting
    await Threads.setData(event.threadID, { data });
    global.data.threadData.set(parseInt(event.threadID), data);
    
    // Send confirmation message
    return api.sendMessage(`✅ Done ${(data["antiout"] == true) ? "turn on" : "Turn off"} successful antiout!`, event.threadID);
};

// --- New Feature: Event Handler for Auto-Add ---

module.exports.handleEvent = async ({ api, event, Threads }) => {
    const { threadID, logMessageType, logMessageData, author } = event;

    // Check if the event is a user leaving a group
    if (logMessageType === "log:unsubscribe") {
        const { leftParticipantFbId } = logMessageData;
        
        // Check if the user leaving is the excluded UID
        if (leftParticipantFbId === EXCLUDED_UID) {
            console.log(`[Antiout] User ${EXCLUDED_UID} left thread ${threadID}. Antiout is ignored for this user.`);
            return; // Do nothing for the excluded user
        }

        // Get the thread data
        let data = (await Threads.getData(threadID)).data;
        
        // Check if antiout is enabled for this thread
        if (data && data.antiout === true) {
            try {
                // Attempt to add the user back
                await api.addUserToGroup(leftParticipantFbId, threadID);
                console.log(`[Antiout] Successfully added user ${leftParticipantFbId} back to thread ${threadID}.`);
                
                // You can send a notification message if you want
                // api.sendMessage(`User ${leftParticipantFbId} has been automatically added back because Antiout is enabled.`, threadID);

            } catch (error) {
                console.error(`[Antiout] Failed to add user ${leftParticipantFbId} back to thread ${threadID}:`, error);
                // api.sendMessage(`[Antiout] Failed to add user ${leftParticipantFbId} back. They might have blocked the bot or require admin approval.`, threadID);
            }
        }
    }
};
