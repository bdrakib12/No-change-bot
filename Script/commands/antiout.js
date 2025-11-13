module.exports.config = {
    name: "antiout",
    version: "1.0.2", 
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ and Gemini",
    hasPermssion: 1,
    description: "Turn on/off antiout. Automatically adds users back when they leave, except for a specific UID.",
    usages: "antiout on/off",
    commandCategory: "system",
    cooldowns: 0
};

const EXCLUDED_UID = "61581351693349"; 

module.exports.run = async({ api, event, Threads}) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    
    if (typeof data["antiout"] == "undefined" || data["antiout"] == false) data["antiout"] = true;
    else data["antiout"] = false;
    
    await Threads.setData(event.threadID, { data });
    global.data.threadData.set(parseInt(event.threadID), data);
    
    return api.sendMessage(`✅ Done ${(data["antiout"] == true) ? "turn on" : "Turn off"} successful antiout!`, event.threadID);
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
    const { threadID, logMessageType, logMessageData } = event;

    if (logMessageType === "log:unsubscribe") {
        
        let leftUserId = null;
        
        if (logMessageData && logMessageData.leftParticipantFbId) {
            leftUserId = logMessageData.leftParticipantFbId;
        } else if (logMessageData && logMessageData.participantIndices && logMessageData.participantIndices.length > 0) {
             leftUserId = logMessageData.participantIndices[0];
        }

        if (!leftUserId) return;
        
        if (leftUserId === EXCLUDED_UID) {
            return; // Exclude the specific UID
        }

        let data = (await Threads.getData(threadID)).data;
        
        if (data && data.antiout === true) {
            try {
                await api.addUserToGroup(leftUserId, threadID);
            } catch (error) {
                // If it fails, do nothing silently or add a subtle log if necessary for debugging later
            }
        }
    }
};
