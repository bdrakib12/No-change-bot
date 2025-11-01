module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
   	const moment = require("moment"); // moment.js is retained for consistency
    
    // Optimized getText2 creation: Define a factory function
    const createGetText2 = (cmd) => {
        if (cmd.languages && typeof cmd.languages === 'object') {
            return (...values) => {
                var lang = cmd.languages[global.config.language]?.[values[0]] || '';
                for (var i = values.length; i > 0; i--) { // Fixed loop logic
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, values[i]);
                }
                return lang;
            };
        } else {
            return () => {};
        }
    };

    return async function ({ event }) { // Made function async
        const timeStart = Date.now()
        const time = moment.tz("Asia/Dhaka").format("HH:MM:ss L");
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        
        if (userBanned.has(senderID)|| threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) return;
        
        // Ensure logMessageType is set for easy filtering
        if (event.type == "change_thread_image") event.logMessageType = "change_thread_image"; 
        // Add other log message types here if needed

        for (const [key, eventRun] of events.entries()) {
            if (eventRun.config.eventType && eventRun.config.eventType.indexOf(event.logMessageType) !== -1) {
                try {
                    const getText2 = createGetText2(eventRun); // Reuse the factory function
                    const Obj = {};
                    Obj.api = api
                    Obj.event = event
                    Obj.models= models 
                    Obj.Users= Users 
                    Obj.Threads = Threads
                    Obj.Currencies = Currencies 
                    Obj.getText = getText2;
                    
                    // Crucial: Use await to prevent event loop blockage if run is async (which it should be)
                    await eventRun.run(Obj); 

                    if (DeveloperMode == true) // Simplified boolean check
                    	logger(global.getText('handleEvent', 'executeEvent', time, eventRun.config.name, threadID, Date.now() - timeStart), '[ Event ]');
                } catch (error) {
                    logger(global.getText('handleEvent', 'eventError', eventRun.config.name, error.stack || error.message), "error");
                }
            }
        }
        return;
    };
}
