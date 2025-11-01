module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return function ({ event }) {
        const startTime = Date.now();
        const time = moment.tz("Asia/Dhaka").format("HH:mm:ss L");
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;

        let { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (!allowInbox && senderID === threadID)) return;

        if (event.type === "change_thread_image") event.logMessageType = "change_thread_image";

        for (const [key, value] of events.entries()) {
            if (value.config.eventType.includes(event.logMessageType)) {
                try {
                    value.run({ api, event, models, Users, Threads, Currencies });
                    if (DeveloperMode) logger(global.getText('handleEvent', 'executeEvent', time, value.config.name, threadID, Date.now() - startTime), '[ Event ]');
                } catch (error) {
                    logger(global.getText('handleEvent', 'eventError', value.config.name, JSON.stringify(error)), 'error');
                }
            }
        }
    };
};
